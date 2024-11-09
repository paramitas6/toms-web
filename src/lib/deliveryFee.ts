// src/lib/deliveryFee.ts

type Coordinates = {
    latitude: number;
    longitude: number;
  };
  
  const postalCodeData: Map<string, Coordinates> = new Map([
    // M-series Postal Codes
    ["M3A", { latitude: 43.75333877, longitude: -79.32836885 }],
    ["M4A", { latitude: 43.72762668, longitude: -79.31178233 }],
    ["M5A", { latitude: 43.65588611, longitude: -79.36495266 }],
    ["M6A", { latitude: 43.72271568, longitude: -79.44447858 }],
    ["M7A", { latitude: 43.66396489, longitude: -79.39180859 }],
    ["M9A", { latitude: 43.66550576, longitude: -79.52611183 }],
    ["M1B", { latitude: 43.80596826, longitude: -79.20636485 }],
    ["M3B", { latitude: 43.74503159, longitude: -79.35852431 }],
    ["M4B", { latitude: 43.70700647, longitude: -79.30673447 }],
    ["M5B", { latitude: 43.65901901, longitude: -79.37868655 }],
    ["M6B", { latitude: 43.7077905, longitude: -79.44434668 }],
    ["M9B", { latitude: 43.65263238, longitude: -79.55215839 }],
    ["M1C", { latitude: 43.78735546, longitude: -79.15431878 }],
    ["M3C", { latitude: 43.72807051, longitude: -79.34414183 }],
    ["M4C", { latitude: 43.69047458, longitude: -79.31241311 }],
    ["M5C", { latitude: 43.65172794, longitude: -79.37485633 }],
    ["M6C", { latitude: 43.69141414, longitude: -79.43039393 }],
    ["M9C", { latitude: 43.64499601, longitude: -79.57398526 }],
    ["M1E", { latitude: 43.7655735, longitude: -79.19034763 }],
    ["M4E", { latitude: 43.67819081, longitude: -79.29509512 }],
    ["M5E", { latitude: 43.64904182, longitude: -79.37717011 }],
    ["M6E", { latitude: 43.68833386, longitude: -79.44912232 }],
    ["M1G", { latitude: 43.76832373, longitude: -79.2173595 }],
    ["M4G", { latitude: 43.70729543, longitude: -79.36881987 }],
    ["M5G", { latitude: 43.65651146, longitude: -79.38658946 }],
    ["M6G", { latitude: 43.6679602, longitude: -79.42065067 }],
    ["M1H", { latitude: 43.76665849, longitude: -79.23857907 }],
    ["M2H", { latitude: 43.80133386, longitude: -79.35925969 }],
    ["M3H", { latitude: 43.75155767, longitude: -79.44605173 }],
    ["M4H", { latitude: 43.70479259, longitude: -79.34627492 }],
    ["M5H", { latitude: 43.64967514, longitude: -79.38452606 }],
    ["M6H", { latitude: 43.66501995, longitude: -79.43641279 }],
    ["M1J", { latitude: 43.74623449, longitude: -79.23608622 }],
    ["M2J", { latitude: 43.78047643, longitude: -79.3487952 }],
    ["M3J", { latitude: 43.76164551, longitude: -79.48914655 }],
    ["M4J", { latitude: 43.68582332, longitude: -79.33685048 }],
    ["M5J", { latitude: 43.64237812, longitude: -79.37934508 }],
    ["M6J", { latitude: 43.64889117, longitude: -79.41610943 }],
    ["M1K", { latitude: 43.72942737, longitude: -79.2634248 }],
    ["M2K", { latitude: 43.777389, longitude: -79.38298766 }],
    ["M3K", { latitude: 43.7336949, longitude: -79.46980835 }],
    ["M4K", { latitude: 43.68019148, longitude: -79.35134207 }],
    ["M5K", { latitude: 43.6478967, longitude: -79.40186381 }],
    ["M6K", { latitude: 43.6422907, longitude: -79.42809038 }],
    ["M1L", { latitude: 43.70856418, longitude: -79.28460087 }],
    ["M2L", { latitude: 43.75302967, longitude: -79.38007257 }],
    ["M3L", { latitude: 43.73521466, longitude: -79.51002876 }],
    ["M4L", { latitude: 43.67069922, longitude: -79.3172673 }],
    ["M5L", { latitude: 43.6589536, longitude: -79.39846513 }],
    ["M6L", { latitude: 43.71335076, longitude: -79.48785667 }],
    ["M9L", { latitude: 43.75801374, longitude: -79.55935752 }],
    ["M1M", { latitude: 43.72625053, longitude: -79.23158482 }],
    ["M2M", { latitude: 43.79125265, longitude: -79.41102698 }],
    ["M3M", { latitude: 43.7295141, longitude: -79.49398609 }],
    ["M4M", { latitude: 43.6622523, longitude: -79.34420513 }],
    ["M5M", { latitude: 43.73169078, longitude: -79.41785801 }],
    ["M6M", { latitude: 43.69251261, longitude: -79.4803056 }],
    ["M9M", { latitude: 43.73469675, longitude: -79.53972055 }],
    ["M1N", { latitude: 43.69591021, longitude: -79.26460203 }],
    ["M2N", { latitude: 43.76833863, longitude: -79.40840615 }],
    ["M3N", { latitude: 43.75587519, longitude: -79.51865899 }],
    ["M4N", { latitude: 43.72660529, longitude: -79.39440928 }],
    ["M5N", { latitude: 43.71110272, longitude: -79.41875231 }],
    ["M6N", { latitude: 43.67587645, longitude: -79.4783278 }],
    ["M9N", { latitude: 43.70665484, longitude: -79.51640291 }],
    ["M1P", { latitude: 43.75987211, longitude: -79.27039211 }],
    ["M2P", { latitude: 43.74945417, longitude: -79.39871673 }],
    ["M4P", { latitude: 43.71030028, longitude: -79.39035148 }],
    ["M5P", { latitude: 43.69634791, longitude: -79.41221627 }],
    ["M6P", { latitude: 43.6611305, longitude: -79.46169515 }],
    ["M9P", { latitude: 43.69292834, longitude: -79.53081067 }],
    ["M1R", { latitude: 43.74780733, longitude: -79.30470507 }],
    ["M2R", { latitude: 43.7783533, longitude: -79.44095025 }],
    ["M4R", { latitude: 43.71815719, longitude: -79.4130084 }],
    ["M5R", { latitude: 43.6736753, longitude: -79.40216998 }],
    ["M6R", { latitude: 43.64681855, longitude: -79.44904405 }],
    ["M7R", { latitude: 43.63653207, longitude: -79.61637067 }],
    ["M9R", { latitude: 43.68824251, longitude: -79.55626585 }],
    ["M1S", { latitude: 43.79330521, longitude: -79.26988371 }],
    ["M4S", { latitude: 43.70295368, longitude: -79.38776881 }],
    ["M5S", { latitude: 43.66411115, longitude: -79.39913016 }],
    ["M6S", { latitude: 43.65362961, longitude: -79.48380957 }],
    ["M1T", { latitude: 43.78143937, longitude: -79.30367468 }],
    ["M4T", { latitude: 43.68877512, longitude: -79.38745828 }],
    ["M5T", { latitude: 43.65341946, longitude: -79.39793653 }],
    ["M1V", { latitude: 43.81687119, longitude: -79.28219621 }],
    ["M4V", { latitude: 43.68594921, longitude: -79.40285846 }],
    ["M5V", { latitude: 43.64478721, longitude: -79.39611902 }],
    ["M8V", { latitude: 43.60729883, longitude: -79.49943933 }],
    ["M9V", { latitude: 43.74252566, longitude: -79.58449427 }],
    ["M1W", { latitude: 43.79960556, longitude: -79.32071267 }],
    ["M4W", { latitude: 43.67757895, longitude: -79.38106118 }],
    ["M5W", { latitude: 43.64813354, longitude: -79.37460592 }],
    ["M8W", { latitude: 43.60069759, longitude: -79.53733193 }],
    ["M9W", { latitude: 43.71834528, longitude: -79.5796778 }],
    ["M1X", { latitude: 43.82680039, longitude: -79.22269795 }],
    ["M4X", { latitude: 43.66807429, longitude: -79.36962717 }],
    ["M5X", { latitude: 43.64854489, longitude: -79.38173552 }],
    ["M8X", { latitude: 43.65268229, longitude: -79.51024133 }],
    ["M4Y", { latitude: 43.67027866, longitude: -79.37900716 }],
    ["M7Y", { latitude: 43.664916, longitude: -79.31339654 }],
    ["M8Y", { latitude: 43.63397962, longitude: -79.49735959 }],
    ["M8Z", { latitude: 43.62960316, longitude: -79.51770548 }],
  
    // L-series Postal Codes
    ["L1A", { latitude: 43.95441342, longitude: -78.31045686 }],
    ["L2A", { latitude: 42.90814323, longitude: -78.9361184 }],
    ["L4A", { latitude: 43.98970823, longitude: -79.28220033 }],
    ["L5A", { latitude: 43.58713371, longitude: -79.60736744 }],
    ["L6A", { latitude: 43.86652253, longitude: -79.52711697 }],
    ["L7A", { latitude: 43.70088904, longitude: -79.82645854 }],
    ["L9A", { latitude: 43.23044566, longitude: -79.86924777 }],
    ["L1B", { latitude: 43.96518369, longitude: -78.70116675 }],
    ["L3B", { latitude: 42.98316825, longitude: -79.24070912 }],
    ["L4B", { latitude: 43.85538615, longitude: -79.40075612 }],
    ["L5B", { latitude: 43.57716214, longitude: -79.6304587 }],
    ["L6B", { latitude: 43.88064949, longitude: -79.24561753 }],
    ["L7B", { latitude: 43.94992463, longitude: -79.55477962 }],
    ["L8B", { latitude: 43.34153231, longitude: -79.93852752 }],
    ["L9B", { latitude: 43.20590125, longitude: -79.89598035 }],
    ["L1C", { latitude: 43.92221004, longitude: -78.69000882 }],
    ["L3C", { latitude: 43.00031987, longitude: -79.2640691 }],
    ["L4C", { latitude: 43.87058451, longitude: -79.438873 }],
    ["L5C", { latitude: 43.56353, longitude: -79.65055105 }],
    ["L6C", { latitude: 43.88836121, longitude: -79.33643791 }],
    ["L7C", { latitude: 43.79331732, longitude: -79.87080819 }],
    ["L9C", { latitude: 43.23125126, longitude: -79.90305965 }],
    ["L1E", { latitude: 43.90523679, longitude: -78.79362858 }],
    ["L2E", { latitude: 43.10432621, longitude: -79.08504364 }],
    ["L4E", { latitude: 43.93420856, longitude: -79.45523861 }],
    ["L5E", { latitude: 43.58398999, longitude: -79.56420896 }],
    ["L6E", { latitude: 43.89767802, longitude: -79.26829987 }],
    ["L7E", { latitude: 43.8931081, longitude: -79.75917617 }],
    ["L8E", { latitude: 43.23257396, longitude: -79.71995403 }],
    ["L9E", { latitude: 43.65613368, longitude: -80.05144286 }],
    ["L1G", { latitude: 43.91652332, longitude: -78.86335615 }],
    ["L2G", { latitude: 43.07385928, longitude: -79.0872894 }],
    ["L4G", { latitude: 43.99762699, longitude: -79.46634746 }],
    ["L5G", { latitude: 43.56355655, longitude: -79.58276328 }],
    ["L6G", { latitude: 43.85033688, longitude: -79.33132012 }],
    ["L7G", { latitude: 43.64814515, longitude: -79.90936964 }],
    ["L8G", { latitude: 43.21861285, longitude: -79.74665841 }],
    ["L9G", { latitude: 43.21999731, longitude: -79.98177339 }],
    ["L1H", { latitude: 43.90330488, longitude: -78.86248474 }],
    ["L2H", { latitude: 43.09014535, longitude: -79.12939464 }],
    ["L4H", { latitude: 43.82537416, longitude: -79.59525539 }],
    ["L5H", { latitude: 43.54080517, longitude: -79.61275545 }],
    ["L6H", { latitude: 43.47920495, longitude: -79.70251421 }],
    ["L8H", { latitude: 43.24757043, longitude: -79.79492293 }],
    ["L9H", { latitude: 43.27132634, longitude: -79.95668257 }],
    ["L1J", { latitude: 43.89519896, longitude: -78.90543099 }],
    ["L2J", { latitude: 43.12624055, longitude: -79.10558848 }],
    ["L3J", { latitude: 43.17011903, longitude: -79.46553021 }],
    ["L4J", { latitude: 43.81011048, longitude: -79.45090964 }],
    ["L5J", { latitude: 43.51745955, longitude: -79.6323215 }],
    ["L6J", { latitude: 43.46861272, longitude: -79.65988696 }],
    ["L7J", { latitude: 43.63176765, longitude: -80.03298509 }],
    ["L8J", { latitude: 43.18880733, longitude: -79.77030296 }],
    ["L9J", { latitude: 44.35031652, longitude: -79.67152322 }],
    ["L1K", { latitude: 43.93217588, longitude: -78.84523382 }],
    ["L3K", { latitude: 42.89146732, longitude: -79.25430846 }],
    ["L4K", { latitude: 43.80891373, longitude: -79.5069028 }],
    ["L5K", { latitude: 43.53008059, longitude: -79.66297803 }],
    ["L6K", { latitude: 43.43834516, longitude: -79.68561632 }],
    ["L7K", { latitude: 43.87432092, longitude: -79.9998758 }],
    ["L8K", { latitude: 43.22728826, longitude: -79.79968587 }],
    ["L9K", { latitude: 43.22889343, longitude: -79.93972896 }],
    ["L1L", { latitude: 43.94831331, longitude: -78.88994195 }],
    ["L3L", { latitude: 43.85834969, longitude: -79.5825694 }],
    ["L4L", { latitude: 43.79290186, longitude: -79.57970989 }],
    ["L5L", { latitude: 43.53701151, longitude: -79.69232755 }],
    ["L6L", { latitude: 43.40730354, longitude: -79.71001885 }],
    ["L7L", { latitude: 43.37469551, longitude: -79.76008798 }],
    ["L8L", { latitude: 43.25904434, longitude: -79.84452219 }],
    ["L9L", { latitude: 44.0935944, longitude: -78.9744748 }],
    ["L1M", { latitude: 43.95840512, longitude: -78.96283394 }],
    ["L2M", { latitude: 43.19602327, longitude: -79.21853271 }],
    ["L3M", { latitude: 43.19603025, longitude: -79.55842628 }],
    ["L4M", { latitude: 44.39955441, longitude: -79.6739776 }],
    ["L5M", { latitude: 43.5677811, longitude: -79.71691814 }],
    ["L6M", { latitude: 43.44142696, longitude: -79.74115114 }],
    ["L7M", { latitude: 43.37882966, longitude: -79.81394384 }],
    ["L8M", { latitude: 43.24628424, longitude: -79.83649968 }],
    ["L9M", { latitude: 44.77837, longitude: -79.94885123 }],
    ["L1N", { latitude: 43.88138995, longitude: -78.93395474 }],
    ["L2N", { latitude: 43.19408778, longitude: -79.2509936 }],
    ["L4N", { latitude: 44.36902702, longitude: -79.69489512 }],
    ["L5N", { latitude: 43.58734064, longitude: -79.75617379 }],
    ["L7N", { latitude: 43.34719206, longitude: -79.77847323 }],
    ["L8N", { latitude: 43.25121912, longitude: -79.86219665 }],
    ["L9N", { latitude: 44.10314782, longitude: -79.49331445 }],
    ["L1P", { latitude: 43.89923483, longitude: -78.97342953 }],
    ["L2P", { latitude: 43.15384309, longitude: -79.21444809 }],
    ["L3P", { latitude: 43.87986921, longitude: -79.26328049 }],
    ["L4P", { latitude: 44.2211165, longitude: -79.46450122 }],
    ["L5P", { latitude: 43.69038955, longitude: -79.623774 }],
    ["L6P", { latitude: 43.78231551, longitude: -79.69976276 }],
    ["L7P", { latitude: 43.35176435, longitude: -79.83822319 }],
    ["L8P", { latitude: 43.25355268, longitude: -79.88270526 }],
    ["L9P", { latitude: 44.09483338, longitude: -79.14205119 }],
    ["L1R", { latitude: 43.91240113, longitude: -78.93967059 }],
    ["L2R", { latitude: 43.16700919, longitude: -79.24398235 }],
    ["L3R", { latitude: 43.84953105, longitude: -79.32582831 }],
    ["L4R", { latitude: 44.74730958, longitude: -79.88351315 }],
    ["L5R", { latitude: 43.6040929, longitude: -79.66944418 }],
    ["L6R", { latitude: 43.77620866, longitude: -79.79949079 }],
    ["L7R", { latitude: 43.33597519, longitude: -79.79946457 }],
    ["L8R", { latitude: 43.26234532, longitude: -79.87463029 }],
    ["L9R", { latitude: 44.15132349, longitude: -79.85231123 }],
    ["L1S", { latitude: 43.84130332, longitude: -79.02188528 }],
    ["L2S", { latitude: 43.14642766, longitude: -79.25953622 }],
    ["L3S", { latitude: 43.84346374, longitude: -79.27102128 }],
    ["L4S", { latitude: 43.9257488, longitude: -79.52449929 }],
    ["L5S", { latitude: 43.68014736, longitude: -79.67417509 }],
    ["L6S", { latitude: 43.73351006, longitude: -79.7328072 }],
    ["L7S", { latitude: 43.32460005, longitude: -79.80738721 }],
    ["L8S", { latitude: 43.25777363, longitude: -79.91667332 }],
    ["L9S", { latitude: 44.32735034, longitude: -79.579014 }],
    ["L1T", { latitude: 43.87072596, longitude: -79.04606021 }],
    ["L2T", { latitude: 43.13402347, longitude: -79.22615565 }],
    ["L3T", { latitude: 43.82028995, longitude: -79.39590671 }],
    ["L4T", { latitude: 43.71608848, longitude: -79.64342662 }],
    ["L5T", { latitude: 43.65619515, longitude: -79.6687738 }],
    ["L6T", { latitude: 43.71671045, longitude: -79.69961305 }],
    ["L7T", { latitude: 43.30997259, longitude: -79.84281684 }],
    ["L8T", { latitude: 43.22072592, longitude: -79.83030079 }],
    ["L9T", { latitude: 43.51596745, longitude: -79.86924571 }],
    ["L1V", { latitude: 43.83233696, longitude: -79.11115312 }],
    ["L2V", { latitude: 43.1161764, longitude: -79.2083603 }],
    ["L3V", { latitude: 44.61195369, longitude: -79.4040195 }],
    ["L4V", { latitude: 43.6981035, longitude: -79.62002596 }],
    ["L5V", { latitude: 43.59549154, longitude: -79.69151608 }],
    ["L6V", { latitude: 43.70395012, longitude: -79.76097968 }],
    ["L8V", { latitude: 43.2278608, longitude: -79.84868675 }],
    ["L9V", { latitude: 44.28717151, longitude: -81.37231341 }],
    ["L1W", { latitude: 43.81826051, longitude: -79.09208183 }],
    ["L2W", { latitude: 43.16624659, longitude: -79.27689846 }],
    // "L3W" is Not Assigned
    // Skipping "L3W" as it has no coordinates
    ["L4W", { latitude: 43.63565106, longitude: -79.61819327 }],
    ["L5W", { latitude: 43.63253502, longitude: -79.71822262 }],
    ["L6W", { latitude: 43.67924844, longitude: -79.73606314 }],
    ["L8W", { latitude: 43.20032865, longitude: -79.84937565 }],
    ["L9W", { latitude: 43.91723405, longitude: -80.10573939 }],
    ["L1X", { latitude: 43.8612354, longitude: -79.12270501 }],
    ["L3X", { latitude: 44.04137477, longitude: -79.47431877 }],
    ["L4X", { latitude: 43.61760551, longitude: -79.58130744 }],
    ["L6X", { latitude: 43.67974968, longitude: -79.78531522 }],
    ["L9X", { latitude: 44.44349444, longitude: -79.78028241 }],
    ["L1Y", { latitude: 43.956336, longitude: -79.08831925 }],
    ["L3Y", { latitude: 44.05861667, longitude: -79.45805881 }],
    ["L4Y", { latitude: 43.60352882, longitude: -79.59406248 }],
    ["L6Y", { latitude: 43.65802997, longitude: -79.7529496 }],
    ["L9Y", { latitude: 44.49257083, longitude: -80.2251763 }],
    ["L1Z", { latitude: 43.87267898, longitude: -79.01068313 }],
    ["L3Z", { latitude: 44.1018359, longitude: -79.56492471 }],
    ["L4Z", { latitude: 43.61401392, longitude: -79.64705544 }],
    ["L6Z", { latitude: 43.72626466, longitude: -79.79313207 }],
    ["L9Z", { latitude: 44.49524921, longitude: -80.04510148 }],
  ]);
  
  /**
   * Retrieves the coordinates for a given postal code.
   * @param postalCode - The postal code to look up.
   * @returns The coordinates associated with the postal code.
   * @throws Error if the postal code is not found.
   */
  function getCoordinates(postalCode: string): Coordinates {
    const coordinates = postalCodeData.get(postalCode.toUpperCase());
    if (!coordinates) {
      throw new Error(`Delivery not available for this location - Please contact us.`);
    }
    return coordinates;
  }
  
  /**
   * Calculates the great-circle distance between two coordinates using the Haversine formula.
   * @param origin - The origin coordinates.
   * @param destination - The destination coordinates.
   * @returns The distance in kilometers.
   */
  function haversineDistance(origin: Coordinates, destination: Coordinates): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(destination.latitude - origin.latitude);
    const dLon = toRadians(destination.longitude - origin.longitude);
  
    const lat1 = toRadians(origin.latitude);
    const lat2 = toRadians(destination.latitude);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  
  /**
   * Calculates the distance between two postal codes.
   * @param originPostal - The origin postal code.
   * @param destinationPostal - The destination postal code.
   * @returns The distance in kilometers.
   * @throws Error if either postal code is not found.
   */
  export function calculateDistance(originPostal: string, destinationPostal: string): number {
    const origin = getCoordinates(originPostal);
    const destination = getCoordinates(destinationPostal.slice(0, 3));
    return haversineDistance(origin, destination);
  }
  
  /**
   * Calculates the delivery fee based on the distance between two postal codes.
   * @param originPostal - The origin postal code.
   * @param destinationPostal - The destination postal code.
   * @returns The delivery fee in your currency.
   * @throws Error if either postal code is not found.
   */
  export function calculateDeliveryFee(originPostal: string, destinationPostal: string): number {
    const distance = calculateDistance(originPostal, destinationPostal);
  
    // Define your fee structure here. Example:
    const BASE_FEE = 10; // Base fee in currency units
    const BASE_DISTANCE = 5; // Base distance in kilometers
    const PER_KM_FEE = 1; // Fee per kilometer beyond base distance

    const delFee= Math.ceil((BASE_FEE + (distance - BASE_DISTANCE) * PER_KM_FEE)/5)*5
  
    if (distance <= BASE_DISTANCE) {
      return BASE_FEE;
    } else {
      return delFee
    }
  }
  