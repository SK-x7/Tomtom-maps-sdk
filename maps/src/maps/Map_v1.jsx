import { useEffect } from "react";
import isMobileOrTablet from "../assets/mapsAssets/isMobileOrTablet";
import InfoHint from "../assets/mapsAssets/InfoHint";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { services } from "@tomtom-international/web-sdk-services";
import SidePanel from "../assets/mapsAssets/SidePanel";
import SearchResultsParser from "../assets/mapsAssets/SearchResultParser";
import ResultsManager from "../assets/mapsAssets/ResultManager";
import SearchMarkersManager from "../assets/mapsAssets/SearchMarkerManager";
import DomHelpers from "../assets/mapsAssets/DomHelpers";
import Formatters from "../assets/mapsAssets/Formatters";
import tt from "@tomtom-international/web-sdk-maps";

function MapView() {
  // console.log(tt);

  //   https://api.tomtom.com/search/2/reverseGeocode/52.157831,5.223776.json?key=AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf&radius=100

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
            if(adr==undefined){
                popup.setText("please place at appropriate address");
            }else{
                popup.setText(adr);
            }
            // console.log(add);
            
      })
      .catch((error) => {
        // Handle errors
        console.error("Fetch error:", error);
      });
  }

  useEffect(() => {
    // console.log(tt);

    // /hjbjbj
    tt.setProductInfo("shopifresh", "v1");

    var map = tt.map({
      key: "AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf",
      container: "map",
      center: [15.4, 53.0],
      zoom: 3,
      dragPan: !isMobileOrTablet(),
    });

    //NOTE - we made a marker and currently getting its lat and lang in the console

    //NOTE -
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

    var marker = new tt.Marker()
      .setLngLat([30.5, 50.5])
      .setDraggable(true)
      .addTo(map);

    let popup = new tt.Popup({ offset: popupOffsets, className: "my-class" });
    
    marker
      .on("dragend", () => {
        let cords = marker.getLngLat();
        console.log(cords);
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

    //TODO - understand the code, first fix the popup on map
    //TODO - update the NOTE anchor
    //

    var infoHint = new InfoHint("info", "bottom-center", 5000).addTo(
      document.getElementById("map")
    );
    var errorHint = new InfoHint("error", "bottom-center", 5000).addTo(
      document.getElementById("map")
    );

    // Options for the fuzzySearch service
    var searchOptions = {
      key: "AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf",
      language: "en-GB",
      limit: 10,
    };

    // Options for the autocomplete service
    var autocompleteOptions = {
      key: "AL4E1LlNn2lrxJEG01RmqehBEq9rUXVf",
      language: "en-GB",
    };

    var searchBoxOptions = {
      minNumberOfCharacters: 0,
      searchOptions: searchOptions,
      autocompleteOptions: autocompleteOptions,
      distanceFromPoint: [15.4, 53.0],
    };

    var ttSearchBox = new SearchBox(services, searchBoxOptions);
    console.log(ttSearchBox);
    document
      .querySelector(".tt-side-panel__header")
      .appendChild(ttSearchBox.getSearchBoxHTML());

    var state = {
      previousOptions: {
        query: null,
        center: null,
      },
      callbackId: null,
      userLocation: null,
    };

    map.addControl(
      new tt.FullscreenControl({ container: document.querySelector("body") })
    );
    map.addControl(new tt.NavigationControl());
    new SidePanel(".tt-side-panel", map);

    var geolocateControl = new tt.GeolocateControl({
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

    map.addControl(geolocateControl);

    var resultsManager = new ResultsManager();
    var searchMarkersManager = new SearchMarkersManager(map);

    map.on("load", handleMapEvent);
    map.on("moveend", handleMapEvent);

    ttSearchBox.on("tomtom.searchbox.resultscleared", handleResultsCleared);
    ttSearchBox.on("tomtom.searchbox.resultsfound", handleResultsFound);
    ttSearchBox.on("tomtom.searchbox.resultfocused", handleResultSelection);
    ttSearchBox.on("tomtom.searchbox.resultselected", handleResultSelection);

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
          placeholder: "Query e.g. Washington",
          searchOptions: newSearchOptions,
          autocompleteOptions: newAutocompleteOptions,
          distanceFromPoint: state.userLocation,
        })
      );
    }

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
      tt.services
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
      console.log(resultList,"⚠️⚠️⚠️⤵️");
      console.log(this);
      console.log(results);
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
        resultItem.onclick = function (event) {
          var id = event.currentTarget.getAttribute("data-id");
          console.log(id,"234");
          searchMarkersManager.openPopup(id);
          searchMarkersManager.jumpToMarker(id);
        };
        resultList.appendChild(resultItem);
      });
      resultsManager.append(resultList);
    }
    // jhjbhj
    return () => {
      document
        .querySelector(".tt-side-panel__header")
        .removeChild(ttSearchBox.getSearchBoxHTML());
    };
  }, []);

  return (
    <div className="map-view">
      {/* Map view container */}
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
      </div>
      <div id="map" className="full-map"></div>
      {/* Map container with the id 'map' and the class 'full-map' */}
    </div>
  );
}

export default MapView;
