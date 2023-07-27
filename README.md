# shortest_map_points

#### How to run
 - python3 -m venv ../virtual
 - source ../virtual/bin/activate
 - pip install -r requirements.txt
 - Create .env file paste content inside .env.example with correct values(It requires MapBox access token - https://docs.mapbox.com/playground/directions/)
 - set FETCH_FROM_FILE True(from file) or False(From URL)
 - python manage.py migrate
 - python manage.py runserver

   
   
Note: This uses MapBox API to fetch the route information. 

##### Logic

- Finding the sferiche_pois
- Based on sferiche_poi fetch route information from mapbox API
- Identify nearest sferiche points from the coodinates of the route.

TODO: Limiting sferiche points based on distance threshold. 