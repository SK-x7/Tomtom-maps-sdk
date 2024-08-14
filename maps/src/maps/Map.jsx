import { useEffect } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';
// import  SearchMarkerManager  from '@tomtom-international/web-sdk-maps';
import SearchMarkerManager from "../assets/mapsAssets/SearchMarkerManager";
import ResultsManager from "../assets/mapsAssets/ResultManager";
import InfoHint from "../assets/mapsAssets/InfoHint";
import DomHelpers from "../assets/mapsAssets/DomHelpers";
import Formatters from "../assets/mapsAssets/Formatters";
import SidePanel from "../assets/mapsAssets/SidePanel";
import SearchResultsParser from "../assets/mapsAssets/SearchResultParser";
import "./../index.css"
import { useState } from 'react';
import {apiKey} from "./../utils"





function Map() {
  const [addreess,setAddreess]=useState();
  const [area,setArea]=useState();
  
  function getMarkerAddress(lat,lng) {
    let apiUrl = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf&radius=100`; // Replace with your API endpoint URL

    // Make a GET request
    fetch(apiUrl)
      .then((response) => {
        // Check if the request was successful (status code 200)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
            let adr=data.addresses[0].address.freeformAddress;
            let  municipality=data.addresses[0].address.municipalitySubdivision||data.addresses[0].address.municipality;
            if(adr==undefined){
                setAddreess("please place marker at appropriate address")
                // popup.setText("please place at appropriate address");
            }else{
                // popup.setText(adr);
                setAddreess(adr);
                setArea(municipality)
            }
            // console.log(add);
            
      })
      .catch((error) => {
        // Handle errors
        console.error("Fetch error:", error);
      });
  }
  
  
  
  
  
  function getAddress(lat,lng,popup) {
    let apiUrl = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf&radius=100`; // Replace with your API endpoint URL

    // Make a GET request
    fetch(apiUrl)
      .then((response) => {
        // Check if the request was successful (status code 200)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        // Handle the JSON data
        // console.log(data.addresses[0].address.freeformAddress);
            let adr=data.addresses[0].address.freeformAddress;
            let  municipality=data.addresses[0].address.municipalitySubdivision||data.addresses[0].address.municipality;
            if(adr==undefined){
                popup.setText("please place at appropriate address");
            }else{
                popup.setText(adr);
                setAddreess(adr);
                setArea(municipality)
            }
            // console.log(add);
            
      })
      .catch((error) => {
        // Handle errors
        console.error("Fetch error:", error);
      });
  }
  
  
  
  useEffect(() => {
    const map = tt.map({
      key: apiKey,
      container: "map",
      center: [77.5, 28],
      zoom: 3,
      // dragPan: !isMobileOrTablet(),
    });
    
    
    map.addControl(
      new tt.FullscreenControl({ container: document.querySelector(".map-view") })
    );
    map.addControl(new tt.NavigationControl());
    
    //SECTION - marker creation
    var markerHeight = 50,
    markerRadius = 10,
    linearOffset = 25;
  var popupOffsets = {
    top: [0, 0],
    "top-left": [0, 0],
    "top-right": [0, 0],
    bottom: [0, -markerHeight],
    "bottom-left": [
      linearOffset,
      (markerHeight - markerRadius + linearOffset) * -1,
    ],
    "bottom-right": [
      -linearOffset,
      (markerHeight - markerRadius + linearOffset) * -1,
    ],
    left: [markerRadius, (markerHeight - markerRadius) * -1],
    right: [-markerRadius, (markerHeight - markerRadius) * -1],
  };

  let marker = new tt.Marker()
  .setLngLat([77.5, 28])
    .setDraggable(true)
    .addTo(map);
    
    let popup = new tt.Popup({ offset: popupOffsets, className: "my-class" });
    
    marker
      .on("dragend", () => {
        let cords = marker.getLngLat();
        // console.log(cords);
        popup
          .setLngLat(marker.getLngLat())
          .setText("fetching address...")
          .addTo(map);
        //   console.log(cords.lat);
        //   console.log(cords.lng);
          getAddress(cords.lat,cords.lng,popup);
          //REVIEW - 
        // popup.setText(adr);
        // console.log(popup);
      })
      .on("dragstart", () => {
        // adr = getAddress(cords.lat,cords.lng);
      });
  //!SECTION
  
  
  //SECTION - options
  
  const searchOptions = {
    key: "AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf",
    language: "en-GB",
    limit: 15,
  };

  // Options for the autocomplete service
  const autocompleteOptions = {
    key: "AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf",
    language: "en-GB",
  };

  const searchBoxOptions = {
    minNumberOfCharacters: 0,
    searchOptions: searchOptions,
    autocompleteOptions: autocompleteOptions,
    distanceFromPoint: [15.4, 53.0],
  };
  // geolocateControl is to find user location by button
  const geolocateControl = new tt.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: false,
    },
  });

  geolocateControl.on("geolocate", function (event) {
    var coordinates = event.coords;
    state.userLocation = [coordinates.longitude, coordinates.latitude];
    ttSearchBox.updateOptions(
      Object.assign({}, ttSearchBox.getOptions(), {
        distanceFromPoint: state.userLocation,
      })
    );
  });
  
  
  map.on("click",()=>{
    
  })
  map.addControl(geolocateControl);
  new SidePanel(".tt-side-panel", map);

  
  let state = {
    previousOptions: {
      query: null,
      center: null,
    },
    callbackId: null,
    userLocation: null,
  };
  //!SECTION -
  
  
  
  //SECTION - 
  function handleMapEvent() {
    // Update search options to provide geobiasing based on current map center
    var oldSearchOptions = ttSearchBox.getOptions().searchOptions;
    var oldautocompleteOptions = ttSearchBox.getOptions().autocompleteOptions;
    var newSearchOptions = Object.assign({}, oldSearchOptions, {
      center: map.getCenter(),
    });
    var newAutocompleteOptions = Object.assign({}, oldautocompleteOptions, {
      center: map.getCenter(),
    });
    ttSearchBox.updateOptions(
      Object.assign({}, searchBoxOptions, {
        placeholder: "Search a new address",
        value:"j",
        searchOptions: newSearchOptions,
        autocompleteOptions: newAutocompleteOptions,
        distanceFromPoint: state.userLocation,
      })
    );
  }
  //!SECTION
  
  
  map.on("load", handleMapEvent);
  map.on("moveend", handleMapEvent);
  let searchMarkersManager = new SearchMarkerManager(map);
  let resultsManager = new ResultsManager();
  let infoHint = new InfoHint("info", "bottom-center", 5000).addTo(
    document.getElementById("map")
  );
  let errorHint = new InfoHint("error", "bottom-center", 5000).addTo(
    document.getElementById("map")
  );
  
  
  
  
  let ttSearchBox = new SearchBox(services, searchBoxOptions);
  //FIXME - 
  document
  .querySelector(".tt-side-panel__header")
  .appendChild(ttSearchBox.getSearchBoxHTML());
  

  function handleResultsCleared() {
    searchMarkersManager.clear();
    resultsManager.clear();
  }
  
  
  function handleResultsFound(event) {
    // Display fuzzySearch results if request was triggered by pressing enter
    if (
      event.data.results &&
      event.data.results.fuzzySearch &&
      event.data.metadata.triggeredBy === "submit"
    ) {
      var results = event.data.results.fuzzySearch.results;

      if (results.length === 0) {
        handleNoResults();
      }
      
      // console.log(results);
      searchMarkersManager.draw(results);
      resultsManager.success();
      fillResultsList(results);
      fitToViewport(results);
    }

    if (event.data.errors) {
      errorHint.setMessage("There was an error returned by the service.");
    }
  }
  
  function handleResultSelection(event) {
    if (isFuzzySearchResult(event)) {
      4;
      // Display selected result on the map
      var result = event.data.result;
      resultsManager.success();
      marker.setLngLat(result.position)
      searchMarkersManager.draw([result]);
      fillResultsList([result]);
      searchMarkersManager.openPopup(result.id);
      fitToViewport(result);
      state.callbackId = null;
      infoHint.hide();
    } else if (stateChangedSinceLastCall(event)) {
      var currentCallbackId = Math.random().toString(36).substring(2, 9);
      state.callbackId = currentCallbackId;
      // Make fuzzySearch call with selected autocomplete result as filter
      handleFuzzyCallForSegment(event, currentCallbackId);
    }
  }
  
  ttSearchBox.on("tomtom.searchbox.resultscleared", handleResultsCleared);
  ttSearchBox.on("tomtom.searchbox.resultsfound", handleResultsFound);
  ttSearchBox.on("tomtom.searchbox.resultfocused", handleResultSelection);
  ttSearchBox.on("tomtom.searchbox.resultselected", handleResultSelection);
  
  function isFuzzySearchResult(event) {
    return !("matches" in event.data.result);
  }

  function stateChangedSinceLastCall(event) {
    return (
      Object.keys(searchMarkersManager.getMarkers()).length === 0 ||
      !(
        state.previousOptions.query === event.data.result.value &&
        state.previousOptions.center.toString() === map.getCenter().toString()
      )
    );
  }

  function getBounds(data) {
    var southWest;
    var northEast;
    if (data.viewport) {
      southWest = [
        data.viewport.topLeftPoint.lng,
        data.viewport.btmRightPoint.lat,
      ];
      northEast = [
        data.viewport.btmRightPoint.lng,
        data.viewport.topLeftPoint.lat,
      ];
    }
    return [southWest, northEast];
  }

  function fitToViewport(markerData) {
    if (!markerData || (markerData instanceof Array && !markerData.length)) {
      return;
    }
    var bounds = new tt.LngLatBounds();
    if (markerData instanceof Array) {
      markerData.forEach(function (marker) {
        bounds.extend(getBounds(marker));
      });
    } else {
      bounds.extend(getBounds(markerData));
    }
    map.fitBounds(bounds, { padding: 100, linear: true });
  }

  function handleFuzzyCallForSegment(event, currentCallbackId) {
    var query = ttSearchBox.getValue();
    var segmentType = event.data.result.type;

    var commonOptions = Object.assign({}, searchOptions, {
      query: query,
      limit: 15,
      center: map.getCenter(),
      typeahead: true,
      language: "en-GB",
    });

    var filter;
    if (segmentType === "category") {
      filter = { categorySet: event.data.result.id };
    }
    if (segmentType === "brand") {
      filter = { brandSet: event.data.result.value };
    }
    var options = Object.assign({}, commonOptions, filter);

    infoHint.setMessage("Loading results...");
    errorHint.hide();
    resultsManager.loading();
    services
      .fuzzySearch(options)
      .then(function (response) {
        if (state.callbackId !== currentCallbackId) {
          return;
        }
        if (response.results.length === 0) {
          handleNoResults();
          return;
        }
        resultsManager.success();
        searchMarkersManager.draw(response.results);
        fillResultsList(response.results);
        map.once("moveend", function () {
          state.previousOptions = {
            query: query,
            center: map.getCenter(),
          };
        });
        fitToViewport(response.results);
      })
      .catch(function (error) {
        if (error.data && error.data.errorText) {
          errorHint.setMessage(error.data.errorText);
        }
        resultsManager.resultsNotFound();
      })
      .finally(function () {
        infoHint.hide();
      });
  }

  function handleNoResults() {
    resultsManager.clear();
    resultsManager.resultsNotFound();
    searchMarkersManager.clear();
    infoHint.setMessage(
      'No results for "' +
        ttSearchBox.getValue() +
        '" found nearby. Try changing the viewport.'
    );
  }

  function fillResultsList(results) {
    resultsManager.clear();
    var resultList = DomHelpers.createResultList();
    // console.log(resultList,"⚠️⚠️⚠️⤵️");
    // console.log(this);
    // console.log(results);
    results.forEach(function (result) {
      var distance = state.userLocation
        ? SearchResultsParser.getResultDistance(result)
        : undefined;
      var addressLines = SearchResultsParser.getAddressLines(result);
      var searchResult = DomHelpers.createSearchResult(
        addressLines[0],
        addressLines[1],
        distance ? Formatters.formatAsMetricDistance(distance) : ""
      );

      var resultItem = DomHelpers.createResultItem();
      resultItem.appendChild(searchResult);
      resultItem.setAttribute("data-id", result.id);
      resultItem.setAttribute("lng", result.position.lng);
      resultItem.setAttribute("lat", result.position.lat);
      // resultItem.setAttribute("lat", result.id);
      resultItem.onclick = function (event) {
        var id = event.currentTarget.getAttribute("data-id");
        var long = event.currentTarget.getAttribute("lng");
        var lat = event.currentTarget.getAttribute("lat");
        // getAddress(lat,long,popup);
        marker.setLngLat([long,lat])
        getMarkerAddress(lat,long);
        
        searchMarkersManager.openPopup(id,marker);
        searchMarkersManager.jumpToMarker(id);
        // getAddress(lat,long,popup)
        
        //ANCHOR - 
      };
      resultList.appendChild(resultItem);
    });
    resultsManager.append(resultList);
  }
  
  
  return () => {
    document
      .querySelector(".tt-side-panel__header")
      .removeChild(ttSearchBox.getSearchBoxHTML());
  };
    
  }, [])
  
  

  return (
    <div className="map-view">
      {/* Map view container */}
      <div className='map-container'>
        
      <div id="map" className="full-map" ></div>
      </div>

      
      <div className="tt-side-panel">
        {/* Side panel container */}
        <header className="tt-side-panel__header">
          {/* Header section of the side panel */}
        </header>
        <div className="tt-tabs js-tabs">
          {/* Tabs container within the side panel */}
          <div className="tt-tabs__panel">
            {/* Panel within the tabs container */}
            <div className="js-results" hidden={true}></div>
            {/* Results section with initial hidden attribute */}
            <div className="js-results-loader" hidden={true}>
              {/* Loader for results, initially hidden */}
              <div className="loader-center">
                {/* Centered loader section */}
                <span className="loader"></span>
                {/* Loader element */}
              </div>
            </div>
            <div className="tt-tabs__placeholder js-results-placeholder"></div>
            {/* Placeholder for results within the tabs container */}
          </div>
        </div>
        <div className='xx'>
          <span> Click on the search result or move marker to select a location</span>
          <div>
          <h3>{area}</h3>
            <span>{addreess}</span>
          </div>
          <button>Confirm and Continue</button>
        </div>
      </div>
      
    </div>
  );
}

export default Map
