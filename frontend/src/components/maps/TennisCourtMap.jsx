import { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128, // New York City coordinates as default
  lng: -74.0060
};

const libraries = ['places'];

const TennisCourtMap = ({ location, onSelectLocation }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState(location || '');
  const [center, setCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const onMapLoad = useCallback((map) => {
    setMap(map);
    if (location) {
      searchTennisCourts(location);
    }
  }, [location]);

  const searchTennisCourts = (query) => {
    if (!map || !query) return;

    const service = new window.google.maps.places.PlacesService(map);
    
    service.textSearch({
      query: `tennis courts ${query}`,
      type: ['park', 'gym']
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const newMarkers = results.map(place => ({
          id: place.place_id,
          position: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          title: place.name,
          address: place.formatted_address
        }));
        
        setMarkers(newMarkers);
        
        if (newMarkers.length > 0) {
          setCenter(newMarkers[0].position);
        }
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchTennisCourts(searchQuery);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    if (onSelectLocation) {
      onSelectLocation(`${marker.title}, ${marker.address}`);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="tennis-court-map">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tennis courts by location"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
        </div>
      </form>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3 className="font-bold">{selectedMarker.title}</h3>
              <p>{selectedMarker.address}</p>
              <button
                onClick={() => {
                  if (onSelectLocation) {
                    onSelectLocation(`${selectedMarker.title}, ${selectedMarker.address}`);
                  }
                  setSelectedMarker(null);
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Select this location
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default TennisCourtMap;
