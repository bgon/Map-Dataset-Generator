# Introduction
Create pairs of maps as training data for machine learning applications.

# Usage
You need to get an API key from https://developers.google.com/maps/documentation/javascript/get-api-key#key to run it and is intented for private use only.
```html
<script src="http://maps.google.com/maps/api/js?key=<APIKEY>&libraries=places&callback=initScript" async defer></script>
```
# Demo
http://bgon.github.io/Map-Dataset-Generator/

# Interface
![UI](images/ui.png?raw=true "")

# Output files
### R_16_52.37247161913425_4.899257492065431.jpg
![Amsterdam Road Map](images/R_16_52.37247161913425_4.899257492065431.jpg?raw=true "")
### S_16_52.37247161913425_4.899257492065431.jpg
![Amsterdam Satellite Map](images/S_16_52.37247161913425_4.899257492065431.jpg?raw=true "")

# Dependencies
* html2canvas.js, renders the current page as a canvas image https://github.com/niklasvh/html2canvas
* canvas-toBlob.js, create Blob objects from an HTML canvas element https://github.com/blueimp/JavaScript-Canvas-to-Blob
* FileSaver.min.js, implements the HTML5 W3C saveAs() FileSaver interface in browsers that do not natively support it https://github.com/eligrey/FileSaver.js/
* jspdf.js and addimage.js for pdf creation https://github.com/MrRio/jsPDF
* ionicons icons https://github.com/driftyco/ionicons/