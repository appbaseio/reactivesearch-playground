# Reactivesearch Playground 

 A web playground which makes it easy for developers to work with Appbase.io REST API.

 ## Features

- ✨ Context-aware autocompletion & error highlighting
- 🚥 Easy embeddability

## Commands

TSDX scaffolds your new library inside `/src`, and also sets up a [Parcel-based](https://parceljs.org) playground for it inside `/example`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run the example playground:

#### Example

Then run the example inside another:

```bash
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**, we use [Parcel's aliasing](https://parceljs.org/module_resolution.html#aliases).

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

### How to use

Upon visiting the :link:  [playground](https://play.reactivesearch.io/), the below interface is displayed: 
![image](https://user-images.githubusercontent.com/57627350/135894891-ea797e29-8318-43da-84cd-f28bae9dcc31.png)

- **1**: The url input takes the endpoint url of your indexed dataset.
- **2**: Use the query editor area to input your reactivesearch/ elasticsearch queries.
- **3**: Use the optional header area to pass any required/ optional headers with the query request.
- **4**: The response area displays the response fetched, after clicking the Play button, which is used to fire the query.
- **5**: Optionally, one can copy the cURL command for the processed query.
- **6**: `Share` functionality enables to share the current state of your playground.
  ![image](https://user-images.githubusercontent.com/57627350/135896126-6a912a82-5b94-454f-b490-3662d3440f7f.png)
- **7**: `Settings` lets one edit various playground settings.
 ![image](https://user-images.githubusercontent.com/57627350/135896476-14d20919-d181-4955-ac5b-dd82f56ad76a.png)


**An example**

Click [here](https://play.reactivesearch.io/embed/6DiWds64RZvbOPQ1EVme) to check the example live: 

![image](https://user-images.githubusercontent.com/57627350/135894999-0ce1a321-d1b9-47a2-9f2e-c661b81a7c70.gif)