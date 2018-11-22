# Templyte

Templyte is a web application which is designed to help users create and share code templates to allow for fast bootstrapping of a variety of projects.

## Features

* Users can create and upload templates that are populated with user defined variables at download time, allowing for highly customisable starter code for any project.
* Templates are language agnostic, so users are not limited according to the technologies that their projects use.
* The application contains a tutorial page that guides users through creating templates.
* Secure login through GitHub is supported.
* The application allows users to rate templates as well as leave text reviews.
* The application supports searching the database for templates based on the title or user defined tags. Partial fuzzy matching is supported, so users do not need to provide an exact much for the search term. (in terms of capitalization or spacing) Search results can also be ordered according to rating, number of downloads, creation date and last downloaded date.

## Running the Application

Templyte is a web application with both a front end and a backend component, as well as a database component in order to allow for persistence.

### Dependency Management

The dependencies of the application are handled by [npm](https://www.npmjs.com/get-npm), the Node package manager which can be installed alongside [Node.js](https://nodejs.org/en/download). The application requires Node.js in order to run the server, which both serves the static frontend components to users and carries out any backend logic for the A.P.I. operations. Therefore, both npm and Node.js must be installed in order to develop or deploy the application. The frontend of the application is built using Angular, but any dependencies required for building the Angular components are handled through npm as well.

### Database Setup

The persistence layer, as well as the login functionality of the application are handled through [Firebase](https://firebase.google.com/). In order to set up the database, one must first create a new Firebase project through the [Firebase console](https://firebase.google.com/). After the project has been created, one must connect it to the application by overriding the Firebase configuration object in `/static/templyte/src/app/config/firebase-config.ts` with the one provided by the console. The fields that must be replaced should be fairly self explanatory - if the configuration object provided by the console does not contain all the required fields, first set up GitHub login (described later) and enable the realtime database as well as the datastore functionality through the console. In order to enable GitHub login, follow the steps provided within the 'Authentication' tab of the Firebase console.

Once the database has been connected, it is extremely important to set up rules for both the realtime database and the datastore, to allow for securing as well as fficient indexing of data. These rules can be found in `database-rules.json` and `datastore-rules.txt` respectively and can simply be copied into the 'rules' section of their respective firebase console pages. It is extremely important to set both sets of rules up before deployment.

Note that currently, the configuration object in `/static/templyte/src/app/config/firebase-config.ts` refers to an example development database. When deploying the application, it is recommended that you replace this information with the connection information for the production database.

### Development Server

### Deployment to Production
