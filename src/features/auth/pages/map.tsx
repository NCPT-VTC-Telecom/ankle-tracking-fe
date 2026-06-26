import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import * as MapxusMap from '@mapxus/mapxus-map';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapxus/mapxus-map/dist/index.css';
import _ from 'lodash';

// interface LocationPoint {
//   featureId: number;
//   point: { lngLat: [number, number]; floorId: string; floorName: string } | null;
//   markerProperties: any;
//   value: string;
//   active: boolean;
// }
interface Building {
  poiId: string;
  buildingId: string;
  name: { [key: string]: string };
  location: { lngLat: { lat: number; lon: number }; address: { [key: string]: string } };
  image?: string; // URL hình ảnh (nếu có)
  rating?: number; // Đánh giá sao (nếu có)
  reviewCount?: number; // Số lượng đánh giá (nếu có)
}
const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapxusMap.Map | null>(null);
  const [maplibreMap, setMaplibreMap] = useState<maplibregl.Map | null>(null);
  // const [instructions, setInstructions] = useState<any[]>([]);
  // const [routePainter, setRoutePainter] = useState<MapxusMap.RoutePainter | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [buildings, setBuildings] = useState<any[]>([]);
  // const [selectedLang, setSelectedLang] = useState('en');
  const selectedLang = 'en';
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null); // State để lưu building được chọn

  // const [fromLocation, setFromLocation] = useState<LocationPoint>({
  //   featureId: 1,
  //   point: null,
  //   markerProperties: null,
  //   value: '',
  //   active: false
  // });
  // const [toLocation, setToLocation] = useState<LocationPoint>({
  //   featureId: 2,
  //   point: null,
  //   markerProperties: null,
  //   value: '',
  //   active: false
  // });
  // const [distance, setDistance] = useState('');
  // const [errorTip, setErrorTip] = useState('');
  // const buildingService = new MapxusMap.BuildingsService();
  // const routeService = new MapxusMap.RouteService();
  // const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  const isLoading = false;
  useEffect(() => {
    if (!mapContainer.current) return;

    const mlMap = new maplibregl.Map({
      container: mapContainer.current,
      zoom: 17
    });

    const mxMap = new MapxusMap.Map({
      map: mlMap,
      appId: import.meta.env.VITE_APP_MAP_APPID || '',
      secret: import.meta.env.VITE_APP_MAP_SECRET || '',
      buildingId: import.meta.env.VITE_APP_BUILDING_ID || '',
      fitBuildingBounds: true
    });

    // const painter = new MapxusMap.RoutePainter(mlMap);

    setMaplibreMap(mlMap);
    setMap(mxMap);
    // setRoutePainter(painter);

    return () => mlMap.remove();
  }, []);

  const handleSearch = useCallback(async (value: string) => {
    const service = new MapxusMap.PoisService();

    if (!value.trim()) {
      setBuildings([]);
      return;
    }
    try {
      const buildingId = import.meta.env.VITE_APP_BUILDING_ID || '';
      const res = await service.searchByBuilding({ keywords: value, buildingId });
      setBuildings(res.data.result.pois || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, []);

  //eslint-disable-next-line
  const handleSearchDebounced = useCallback(_.debounce(handleSearch, 500), [handleSearch]);

  const handleClearSearch = () => {
    setSearchValue('');
    setBuildings([]);
  };
  const handleSelectBuilding = (building: Building) => {
    if (map && building.location?.lngLat) {
      maplibreMap?.flyTo({
        center: [building.location.lngLat.lon, building.location.lngLat.lat],
        zoom: 18
      });
      map.selectBuildingById(building.buildingId);
    }
    setSelectedBuilding(building); // Hiển thị chi tiết
  };

  const closeDetail = () => {
    setSelectedBuilding(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div id="map" ref={mapContainer} className="h-full w-full" />
      <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                handleSearchDebounced(e.target.value);
              }}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchValue && (
              <span
                className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjIwIiB3aWR0aD0iMjAiPg0KICA8cGF0aCBkPSJtNSA1IDAgMS41IDMuNSAzLjUtMy41IDMuNSAwIDEuNSAxLjUgMCAzLjUtMy41IDMuNSAzLjUgMS41IDAgMC0xLjUtMy41LTMuNSAzLjUtMy41IDAtMS41LTEuNSAwLTMuNSAzLjUtMy41LTMuNS0xLjUgMHoiIGZpbGw9IiMwMDAiLz4NCjwvc3ZnPg==')] bg-no-repeat bg-center bg-contain"
                onClick={handleClearSearch}
              />
            )}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>

          {isLoading ? (
            <div className="mt-2 text-center text-gray-500">Loading...</div>
          ) : buildings.length > 0 ? (
            <ul className="mt-2 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              {buildings.map((building) => (
                <li
                  key={building.poiId}
                  className="flex items-start px-3 py-3 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-0 transition-colors"
                  onClick={() => handleSelectBuilding(building)}
                >
                  <span className="mr-2 text-blue-500">📍</span>
                  <div>
                    <div className="font-medium">{building.name?.[selectedLang] ?? building.name.default}</div>
                    {building.location?.address && (
                      <div className="text-xs text-gray-500">
                        {building.location.address[selectedLang] ?? building.location.address.default}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            searchValue && <div className="mt-2 text-center text-gray-500">No results found</div>
          )}
        </div>
      </div>

      {/* Modal chi tiết giống Google Maps */}
      {selectedBuilding && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-[300px] max-h-[80vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedBuilding.image}
                alt={selectedBuilding.name[selectedLang] || selectedBuilding.name.default}
                className="w-full h-48 object-cover"
              />
              <button onClick={closeDetail} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                ✕
              </button>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold">{selectedBuilding.name[selectedLang] || selectedBuilding.name.default}</h2>
              <div className="text-yellow-500 flex items-center mb-2">
                {'★'.repeat(Math.floor(selectedBuilding.rating || 4.4))}
                <span className="text-gray-600 ml-1 text-sm">({selectedBuilding.reviewCount || 146} reviews)</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {selectedBuilding.location?.address?.[selectedLang] ||
                  selectedBuilding.location?.address?.default ||
                  'No address available'}
              </p>
              <div className="flex space-x-2 mb-4">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Directions</button>
                <button className="bg-gray-200 px-3 py-1 rounded text-sm">Save</button>
                <button className="bg-gray-200 px-3 py-1 rounded text-sm">Nearby</button>
                <button className="bg-gray-200 px-3 py-1 rounded text-sm">Share</button>
              </div>
              <div className="text-sm text-gray-600">
                <button className="text-blue-500 hover:underline mb-2 block">Claim this business</button>
                <button className="text-blue-500 hover:underline mb-2 block">Your Maps activity</button>
                <button className="text-blue-500 hover:underline mb-2 block">Add a label</button>
                <button className="text-blue-500 hover:underline mb-2 block">Suggest an edit</button>
                <div className="mt-2">
                  <span className="text-gray-500">Add missing information</span>
                  <div className="ml-4 mt-1">
                    <button className="text-blue-500 hover:underline block text-sm">Add place's phone number</button>
                    <button className="text-blue-500 hover:underline block text-sm">Add hours</button>
                    <button className="text-blue-500 hover:underline block text-sm">Add website</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
