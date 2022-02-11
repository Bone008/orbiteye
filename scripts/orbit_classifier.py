import pandas as pd

def get_eccentricity(apogee, perigee):
  R_e = 6370 # km
  return (apogee - perigee) / (apogee + perigee + 2*R_e)

def get_altitude(apogee, perigee):
  # TODO: How should this actually be done??
  return max(apogee, perigee)

def get_orbit(entry, ucs = False):
  orbit_class = ""
  orbit_type = ""

  if(ucs):
    # Keys for UCS style
    apogee = entry["Apogee (km)"]
    perigee = entry["Perigee (km)"]
    period = entry["Period (minutes)"]
    inc = entry["Inclination (degrees)"]
    ecc = entry["Eccentricity"]
    alt = get_altitude(apogee, perigee)
  else:
    # Keys for SATCAT style
    apogee = entry["APOGEE"]
    perigee = entry["PERIGEE"]
    period = entry["PERIOD"]
    inc = entry["INCLINATION"] # Should be in [0, 180)
    ecc = get_eccentricity(apogee, perigee)
    alt = get_altitude(apogee, perigee)


  # Check for circular vs. elliptical orbit
  if ecc < 0.14:
    # Altitude is for LEO/MEO but GEO is better logged by period
    
    if alt >= 80 and alt < 1700:
      orbit_class = "LEO"
    elif period >= 1410 and period < 1462:
      orbit_class = "GEO"
    elif alt >= 1700 and alt <= 35700:
      orbit_class = "MEO"

    # LEO and MEO orbits can be typed further
    if orbit_class in ["LEO", "MEO"]:
      if inc < 20 or inc >= 160:
        orbit_type = "Equatorial"
      elif (inc >= 20 and inc < 85) or (inc >= 104 and inc < 160):
        orbit_type = "Non-Polar Inclined"
      elif (inc >= 85 and inc < 95):
        orbit_type = "Polar"
      else: # TODO: extra criteria on sun synchronous
        orbit_type = "Sun-Synchronous"

  else:
    orbit_class = "Elliptical"

    if apogee > 318200:
      orbit_type = "Cislunar"
    elif period > 25*60 and ecc > 0.5:
      orbit_type = "Deep Highly Eccentric"
    elif period >= 11.5*60 and period < 12.5*60 and ecc >= 0.5 and ecc < 0.77 and inc >= 62 and inc < 64:
      orbit_type = "Molniya"
  
  return (orbit_class, orbit_type)

def get_orbit_class(entry):
  return get_orbit(entry)[0]

def get_orbit_type(entry):
  return get_orbit(entry)[1]

def debug_UCS(entry):
  orbit_class, orbit_type = get_orbit(entry, True)
  class_correct = entry["Class of Orbit"] == orbit_class
  type_correct = entry["Type of Orbit"] == orbit_type
  if not class_correct:
    print(f'Error in UCS debug: Expected class {entry["Class of Orbit"]} but got {orbit_class}')
  if not type_correct:
    print(f'Error in UCS debug: Expected type {entry["Type of Orbit"]} but got {orbit_type}')
  
  if not class_correct or not type_correct:
    print(f'Error(s) in satellite w/ COSPAR {entry["COSPAR Number"]}')
  
  return class_correct and type_correct



import sys, getopt
def main(argv):
  inputfile = 'satcat.csv'
  outputfile = 'satcat_with_orbits.csv'
  try:
    opts, args = getopt.getopt(argv, "hi:o:d")
  except getopt.GetoptError:
    print('orbit_classifier.py -i <inputfile> -o <outputfile>')
    print('To debug with UCS use -i <inputfile> -d')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h':
      print('orbit_classifier.py -i <inputfile> -o <outputfile>')
      print('To debug with UCS use -i <inputfile> -d')
      sys.exit()
    elif opt in ("-i", "--ifile"):
      inputfile = arg
    elif opt in ("-o", "--ofile"):
      outputfile = arg
  
  if "-d" in [x[0] for x in opts]:
    if len(inputfile) == 0:
      inputfile = 'UCS-Satellite-Database-9-1-2021.xls'
      print(f'Using default input file ({inputfile})')

    df = pd.read_excel(inputfile)
    df["Class of Orbit"].fillna("", inplace=True)
    df["Type of Orbit"].fillna("", inplace=True)
    correct = df.apply(debug_UCS, axis=1)
    errors = len(correct) - sum(bool(x) for x in correct)
    print(f'{errors} errors detected from {len(correct)} rows.')

  else:
    if len(inputfile) == 0 or len(outputfile) == 0:
      print(f'Using default input and output files ({inputfile}, {outputfile})...')
  
    if inputfile[-4:] != ".csv" or outputfile[-4:] != ".csv":
      print('Input and output files must be CSV format')
      sys.exit(2)
    

    # Process each row and make changes
    df = pd.read_csv(inputfile)
    df['Class of Orbit'] = df.apply(get_orbit_class, axis=1)
    df['Type of Orbit'] = df.apply(get_orbit_type, axis=1)
    df.to_csv(outputfile)



if __name__ == "__main__":
  main(sys.argv[1:])