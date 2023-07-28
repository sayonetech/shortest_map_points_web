import json
import os
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView, View
from applications.navigator.find_shortest_path import get_sferiche_pois, get_sferiche_selected_points, get_data_from_url

MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')
FETCH_FROM_FILE = True if os.getenv('FETCH_FROM_FILE') == 'True' else False
DISTANCE_THRESHOLD = 5  # exclude point if the distance in grater than 5

SFERICHE_URL = "https://dev.phygital.bbsitalia.com/sites/default/files/sferiche/sferiche.json"
POI_URL = "https://dev.phygital.bbsitalia.com/poi-simplified.json"

def convert_to_coordinates_list(all_result):
    path_trace = []
    for sferiche in all_result:
        path_trace.append([
            sferiche['X'], sferiche['Y']
        ])
    return path_trace

# Create your views here.
class NavigatorView(View):
    @csrf_exempt
    def post(self, request, *args, **kwargs):
        input_data = json.loads(request.body)
        # Load all sferiche points
        if FETCH_FROM_FILE:
            with open('sferiche.json', 'r') as f:
                sferiche_data = json.load(f)
        else:
            sferiche_data = get_data_from_url(SFERICHE_URL)

        all_sferiche = []
        for sferiche in sferiche_data['sferiche']:
            all_sferiche.append([float(sferiche['X']),float(sferiche['Y'])])
        sferiche_pois = get_sferiche_pois(input_data, all_sferiche)
        sferiche_selected_points = get_sferiche_selected_points(
            sferiche_pois,  all_sferiche, mapbox_token=MAPBOX_ACCESS_TOKEN,
            distance_threshhold=DISTANCE_THRESHOLD
        )
        all_result = sferiche_pois[:1] + sferiche_selected_points + sferiche_pois[1:]
        all_result_dict = {
            "spheriche": convert_to_coordinates_list(all_result)
        }
        return JsonResponse(data=all_result_dict)

class NavigatorHome(TemplateView):
    template_name = 'index.html'

