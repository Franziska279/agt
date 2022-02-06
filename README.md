# Travelr - A guide to plan your trip

<p align="center">
 <img src="pics\Travelr_Logo.png" alt="Wanderlust"  width=200px; />
</p>






## :mag_right: Overview

This project is a small web application developed in the course Algorithmic Game Theory in the Master's programme Artificial Intelligence and Computer Science at the University of Calabria.

The application aims to provide a solution to the scenario of a road trip that meets the game theory requirements of truth, fairness and finding the greatest social welfare.



This project was accomplished by the following students:

- Franziska Müller, 238887 
- Kerstin Greifensteiner, 238886 
- Ruth Nikol, 234904



## :blue_car: Scenario

The scenario that this project is intended to solve is the implementation of a common road trip among friends.  As everyone surely knows from their own experience, it is not easy to plan a great trip, because each of the participants has different wishes regarding the destinations and costs.

In the project, some specifications have indeed been made. Each of the participants can assign a certain preference to the cities they want to visit. In addition, each of the players specifies the maximum amount they can spend on the trip. Unfortunately, we cannot assume that the players will give their priorities truthfully - because everyone will of course cheat in order to possibly get a better result for themselves. Unfortunately, not every participant can necessarily come along on the trip. The maximum number of people who can come on the trip is the number of seats available in the vehicle used. 
In addition, the total length of the tour is also specified. 

The project now has the task of implementing a mechanism that, based on the preferences of the players, their budget and the limitations of the car, tour, etc. will select the tour and those players in a manner that the highest social welfare is achieved. 



<p align="center">
 <img src="pics\InputOutput_Mechanism.png" alt="Wanderlust"  width=800px; />
</p>



The picture shows the individual variables that go into the mechanism. The mechanism, which is not explained in detail here, is intended to ensure that all players state their preferences **truthfully**, that the selection of players and cities is **fair** and that the **highest social welfare** is achieved.

For a better understanding of the mechanism, please refer to the attached report. The mechanism is explained in detail there.



## :triangular_ruler: Implementierung



### :wrench: Technologies 

The decision of technologies depended on existing experiences. Since not a new framework or programming language wanted to be learned, the well-known language *JavaScript* was used. It is straight-forward and allows for easy assembling of objects (*JSON*). Based on this first decision, the web application was developed using following frameworks:



-    **NodeJS** (https://nodejs.org/en/) - backend server

-    **ExpressJS** (https://expressjs.com/) - web framework for NodeJS

-    **PugJS** (https://github.com/pugjs/pug) - template engine

  

A key feature is the integrated and interactive map that will be displayed once a suitable route has been found. It is part of the **HERE Maps API** (https://developer.here.com/) and usable with a free account until a specific (quite high) amount of requests per month. For following features, this API has been used:

- ​    Finding longitude and latitude of a city with postal code

- ​    Retrieving the distance between cities

- ​    Shortest path calculation

- ​    Interactive map

- ​    Route display

- ​    City markings

  

### :rocket: Launch project

To start the project, the Git repositoriy should be cloned.

```bash
git clone https://github.com/Franziska279/agt.git
```



The implementation can be found in the **/travelr** folder. The Travelr project should be opened in a development environment of choice. 

For example, the **WebStorm** environment from IDEA. WebStorm is an integrated development environment for JavaScript and related technologies. Like other JetBrains IDEs, it makes development easier, automates routine tasks and helps you to manage complex tasks easily.

To run the project, NodeJS should of course be installed on the PC. All necessary packages for the project can then be installed with `npm install` in the console.

After that, the project can be configured as a NodeJS application.

To do this, open the runtime configurations (circled in red) and create a NodeJS project. Then enter the name, node interpreter and working directory. The details can be seen in the picture. It is very important to specify the start javascript file - which is **bin\www**.

<p align="center">
 <img src="pics\Configuration.png" alt="Configuration"  />
</p>



The application can then be started (please press the Start button). The application can be accessed via any browser at http://localhost:3000/. 



### :globe_with_meridians: Guide

At http://localhost:3000/ the start page of the small application with logo and start button can be recognised. To calculate a round trip, the start button must be pressed.

<p align="center">
 <img src="pics\travelr-01.PNG" alt="Configuaration" width=600px; />
</p>



Through this displayed button, a page to modify the tour calculation parameters can be accessed. It takes following variables:

-    Starting and ending city with postal code
-    Maximum length of the tour in kilometres
-    Maximum amount of seats for participants
-    Fixed cost
-    Variable cost per kilometre
-    List of all participants stating their budget and city preferences



It is very important that each player is added to the mechanism with the following syntax:

```bash
{City(Postcode): preference, City(Postcode): preference, City(Postcode): preference ....}
```

For example: 

```bash
{Tropea (89861): 8, Scilla (89058): 3, Reggio (89135): -2}
```

<p align="center">
 <img src="pics\travelr-02.PNG" alt="Configuaration" width=800px; />
</p>



Once the user clicks on the "Compute'' button, the next page will be loaded. It includes a loading screen to indicate, that the request is being processed.



At this point, some errors can occur: 

1) the HERE Maps API has rejected all requests to obtain city distances (technical issues) 
2) there has been an error during the calculation. The first error happens if some requests are sent too fast after one another. CORS (Cross-Origin Resource Sharing) might block the request. This is tried to counteract through a small waiting time between sending requests and a maximum number of retries of the same request. The second error can happen when user data was not inserted correctly or when the calculation did not deliver a result (= undefined).

If the route and participants could be determined successfully, following data can be found on the final page (after the loading screen disappears) 

<p align="center">
 <img src="pics\travelr-04.PNG" alt="Configuaration" />
</p>



On the upper left of the screen, a specific button can be found. It shows or hides the debug output that has been built during the calculation. This debug log is supposed to show every important step of the algorithm/mechanism. Only relevant data will be displayed there.



### :warning: Known issues

"Travelr'' is a simple web application to show that our mechanism can be implemented to fill the gap on the market. However, to be able to do so, there are several important and security relevant features missing. 

Until now, the user input has to follow strict syntactic guidelines. There is no validation of wrong or harmful input. The application works once started. If there is some downtime, the data cannot be persisted, since it has no database. In order to be used by several people at the same time, some other software design issues have to be considered, like distribution and security (of more than just the user input). 

As already mentioned another error is highly possible. The error from HERE Maps API, regarding CORS, could not be solved during development of this project. 

Altogether, for the purpose of this project, these known issues can be neglected or have a temporary workaround. This project serves as a first working implementation of the mechanism. Refinements and dealing with theses issues can be done in future development. 


