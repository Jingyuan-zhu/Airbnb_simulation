import openai
import json
import pandas as pd
import time
from tqdm import tqdm
import os
import concurrent.futures

# Function to analyze sentiment for a single comment
def analyze_sentiment(comment, client, retries=3):
    if pd.isna(comment) or comment.strip() == '':
        return 'No content'
        
    prompt = f"""
    Please analyze the sentiment of the following comment and return ONLY a valid JSON 
    with this exact format: {{"sentiment": "Positive"}} or {{"sentiment": "Negative"}} or {{"sentiment": "Neutral"}}
    
    Comment: {comment}
    """
    
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            ).choices[0].message.content
            
            # Try to extract valid JSON
            try:
                # Look for JSON structure if it's embedded in other text
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    
                    # Verify the expected keys exist
                    if "sentiment" in result:
                        return result["sentiment"]
            except json.JSONDecodeError:
                pass
                
            # If we're here, either JSON parsing failed or format was wrong
            time.sleep(1)  # Brief pause before retry
        except Exception as e:
            print(f"Error during API call: {e}")
            time.sleep(2)  # Longer pause if API error
            
    # Return "Unknown" if all retries failed
    return "Unknown"

# Process a batch of comments
def process_batch(comments_batch, indices, client):
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        # Submit all tasks and map them to their indices
        future_to_idx = {
            executor.submit(analyze_sentiment, comment, client): idx 
            for idx, comment in zip(indices, comments_batch)
        }
        
        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                sentiment = future.result()
                results[idx] = sentiment
            except Exception as e:
                print(f"Error processing comment at index {idx}: {e}")
                results[idx] = "Error"
                
    return results

# IMPROVED VERSION: Function to process dataframe with proper backup handling
def process_reviews_with_sentiment_improved(df, client, batch_size=100, save_interval=1000):
    """
    Process reviews with sentiment analysis, with improved backup handling.
    This version ensures that the backup always contains all rows from the original dataset.
    
    Args:
        df: DataFrame containing reviews with a 'comments' column
        client: OpenAI client instance
        batch_size: Number of comments to process in each batch
        save_interval: How often to save backup (in number of processed rows)
        
    Returns:
        DataFrame with sentiment analysis results
    """
    # Check if backup exists and load it
    backup_file = 'backups/reviews_sentiment_backup.csv'
    if os.path.exists(backup_file):
        try:
            backup_df = pd.read_csv(backup_file)
            print(f"Loading from backup file with {len(backup_df)} rows")
            
            # Check if backup has fewer rows than original dataset
            if len(backup_df) < len(df):
                print(f"WARNING: Backup has fewer rows ({len(backup_df)}) than original dataset ({len(df)})")
                print(f"Creating a full result dataframe with all {len(df)} rows")
                
                # Create a full result dataframe with all original rows
                result_df = df.copy()
                
                # Add sentiment column if it doesn't exist
                if 'sentiment' not in result_df.columns:
                    result_df['sentiment'] = None
                
                # Copy sentiment values from backup to corresponding rows in full dataset
                print("Transferring sentiment values from backup to full dataset...")
                
                # Try matching on 'id' column
                if 'id' in backup_df.columns and 'id' in result_df.columns:
                    merged_count = 0
                    for _, backup_row in backup_df.iterrows():
                        # Skip rows without sentiment
                        if pd.isna(backup_row.get('sentiment')):
                            continue
                        
                        # Find matching row in full dataset
                        matches = result_df[result_df['id'] == backup_row['id']]
                        if len(matches) > 0:
                            # Found matching row, update sentiment
                            match_idx = matches.index[0]
                            result_df.loc[match_idx, 'sentiment'] = backup_row['sentiment']
                            merged_count += 1
                    
                    print(f"Transferred {merged_count} sentiment values from backup to full dataset")
            else:
                result_df = backup_df
        except Exception as e:
            print(f"Error loading backup: {e}")
            result_df = df.copy()
    else:
        # Create a copy of the dataframe if no backup exists
        result_df = df.copy()
    
    # Add sentiment column if it doesn't exist
    if 'sentiment' not in result_df.columns:
        result_df['sentiment'] = None
    
    # Create backup directory if it doesn't exist
    os.makedirs('backups', exist_ok=True)
    
    # Process in batches with progress bar
    total_rows = len(result_df)
    
    # Find where to start (skip rows that already have sentiment)
    processed_indices = set(result_df[pd.notna(result_df['sentiment'])].index)
    print(f"Found {len(processed_indices)} already processed rows")
    
    # Prepare batches of unprocessed rows
    pending_indices = [i for i in range(total_rows) if i not in processed_indices]
    
    with tqdm(total=len(pending_indices), desc="Analyzing sentiment") as pbar:
        for i in range(0, len(pending_indices), batch_size):
            # Get indices for this batch
            batch_indices = pending_indices[i:i+batch_size]
            
            # Get comments for this batch
            comments_batch = [result_df.loc[idx, 'comments'] for idx in batch_indices]
            
            # Process batch and get results
            batch_results = process_batch(comments_batch, batch_indices, client)
            
            # Update the dataframe with results
            for idx, sentiment in batch_results.items():
                result_df.loc[idx, 'sentiment'] = sentiment
            
            # Update progress bar
            pbar.update(len(batch_indices))
            
            # Save periodically - ALWAYS SAVE FULL DATASET
            current_position = i + len(batch_indices)
            if current_position % save_interval < batch_size:
                result_df.to_csv(backup_file, index=False)
                print(f"Saved backup with {len(result_df)} rows to {backup_file}")
    
    # Save final result
    result_df.to_csv('reviews_sample_w_sentiment.csv', index=False)
    return result_df

# Example usage:
if __name__ == "__main__":
    # Load the dataset
    print("Loading dataset...")
    df_reviews = pd.read_csv('reviews_sample.csv')
    print(f"Dataset shape: {df_reviews.shape}")
    
    # Initialize OpenAI client
    # client = openai.OpenAI(api_key="your-api-key")
    
    # Process reviews
    # df_with_sentiment = process_reviews_with_sentiment_improved(df_reviews, client) 