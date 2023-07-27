import requests
from shapely.geometry import Point
import geopandas as gpd
from scipy.spatial import distance


def get_data_from_url(url):
    print('Loading from URL......: %s' % url)
    r = requests.get(url)
    if r.status_code != 200:
        print('Error from API, URL: %s, Response: %s' % (url, r.text))
        raise

    data = r.json()
    return data

def closest_node_and_distance(node, nodes):
    # Format node = (long, lat)
    distances = distance.cdist([node], nodes)
    closest_index = distances.argmin()
    closest_node = nodes[closest_index]
    lon1, lat1, lon2, lat2 = *node, *closest_node

    distance_in_m = get_distance_geopands(lat1, lon1, lat2, lon2)
    return closest_node, distance_in_m


def get_distance_geopands(lat1, lon1, lat2, lon2):
    pnt1 = Point(lon1, lat1)
    pnt2 = Point(lon2, lat2)
    points_df = gpd.GeoDataFrame({'geometry': [pnt1, pnt2]}, crs='EPSG:4326')
    points_df = points_df.to_crs('EPSG:5234')
    points_df2 = points_df.shift()  # We shift the dataframe by 1 to align pnt1 with pnt2
    return points_df.distance(points_df2)[1]


def get_sferiche_pois(input_data, all_sferiche):
    sferiche_pois = []
    for point_data in input_data['Pois']:
        lat, long = float(point_data['Lat']), float(point_data['Long'])
        point, dist = closest_node_and_distance((long, lat), all_sferiche)
        sferiche_pois.append({
            "id-poi": point_data['Id_poi'],
            "X": point[0],
            "Y": point[1],
        })
    return sferiche_pois


def prepare_sferiche_pois_for_route(sferiche_pois):
    points_str_list = []
    if len(sferiche_pois) < 2:
        raise Exception('Minimum 2 points needed')
    for sferiche_poi in sferiche_pois:
        points_str_list.append("%s,%s" % (sferiche_poi['X'], sferiche_poi['Y'],))

    return ';'.join(points_str_list)


def get_sferiche_selected_points(sferiche_pois, all_sferiche, mapbox_token, distance_threshhold):
    route_api = "https://api.mapbox.com/directions/v5/mapbox/walking/"\
            "%s?"\
            "alternatives=true&geometries=geojson&language=en&overview=full&steps=true&"\
            "access_token=%s" % (prepare_sferiche_pois_for_route(sferiche_pois), mapbox_token)

    data = get_data_from_url(route_api)

    routes = data['routes'][0]
    sferiche_selected = []
    # _coordinates = []
    for coordinate in routes['geometry']['coordinates']:
        long, lat = coordinate[0], coordinate[1]
        point, dist = closest_node_and_distance((long, lat), all_sferiche)
        if dist < distance_threshhold:  # Will not include in the sferiche list if distance higher
            sferiche_selected.append({
                "id-poi": None,
                "X": point[0],
                "Y": point[1],
            })
        # _coordinates.append([long, lat])
    return sferiche_selected