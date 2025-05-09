## Airbnb Explorer

### CIS 5500 Final Project

#### Group 17: 
- Anbang Chen
- Yuhang Duan
- Tianshu Feng
- Jingyuan Zhu

This is the repository of the our CIS 5500 final project, Airbnb Explorer. Our application provides insights into London's Airbnb market, allowing users to browse listings, view neighborhoods on a map, and explore detailed information about each property. `CIS5500_Data_Cleaning.ipynb` is the code to clean and preprocess the dataset,
while `improved_sentiment.py` is the code for sentimental analysis. `client` folder contains the code for the frontend server, and `server` folder contains the code
for the backend server.

#### Running the app

To start the application, `cd` into both `client` and `server` folders. 

Run `npm install` to install dependencies first and then run `npm start` to start the frontend
and backend servers. The frontend server will be started at `localhost:3000` and the backend server will be started at `localhost:8080` by default. 

You can modify the
port listened for the frontend or backend server by changing the port in `config.json` in the corresponding folder.

To view the API docs, go to `localhost:8080/api-docs`


#### Data cleaning and processing
The data cleaning code is in ```CIS5500_Data_Cleaning.ipynb``` and the sentiment analysis code for review classification is in ```improved_sentiment.py```
