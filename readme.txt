# MEAN stack POKE BAG APP
By - Zakaria Jaouad -

This repo contains the MEAN stack application.

I did not know much about Pokemon GO, or really forgot about it, so I had to refresh my mind a little bit. I based my work on what I remembered from all other pokemon games I played and implemented the specifications given by David Theriault.

I decided to build the APP using MEAN, so you you will need NPM and NODE to use the application. I am using NVM to manage the NPM versions. I am using NPM 5.3.0 and node 8.6.0.
The versions are very important since the pokemon API NODEJS Wrapper uses promises and only the new version of npm let me install it.

----Unzip the folder-----

I have my package.json ready to roll, just cd or go into the folder and run "npm install", it will install all the dependencies for you.
Then you can simply run the command "node app.js".

Then navigate to localhost:8000/

Sometimes, your node app cashes ports and connection on that port, and still thinks that connection is open on that port. If that happens it will error out the application. Please verify that you are not using the 8000 port anywhere. Thank you.

I would have loved to have a bit more time to work on the project and get a better look for it. I started working on the visual a little bit and used a codePen beautiful bootstrap pricing table display to show the pokemons in the bag.
I will keep working on this project as my side project since I liked it a lot, and try to make it better.

!! Be careful !!
The pokemon API can be a pain sometimes during the day or night, since a lot of people are using it and it just slows down and times out, so you might need to refresh the page and try later.

With more time, my next step would have been adding responsive error messages to the user to make it a better usability.
I think I have a strong and good backend for the purpose of this exercise.

#Extra information:

npm install will install mongodb and mongoose, so if you already have them make sure this is run in a virtual environment such as venv or stand-alone VM.
Also, mongoose connect to the database on the mongoDB regular port and would create the database with the correct collections, if it is not present.
The name of the database I used is: "pokebag".

The list of your pokemons in your bag cannot exceed 5, so you can only add up to 5 pokemons to your bag...choose wisely.
Just kidding, you can delete after getting to the maximum, and the button will re-appear and you can add another pokemon.
