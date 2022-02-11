import pandas as pd

## Define column mappings
UCS_MAPPING = {
  "Current Official Name of Satellite": "name",
  "COSPAR Number": "id",
  "Country of Operator/Owner": "owner",
  "Users": "users",
  "Purpose": "purpose",
  "Detailed Purpose": "detailedPurpose",
  "Class of Orbit": "orbitClass",
  "Type of Orbit": "orbitType",
  "Launch Mass (kg.)": "launchMassKg",
  "Comments": "comments",

  # Processed columns
  "Sources": "sources",
}

SATCAT_MAPPING = {
  "OBJECT_NAME": "name",
  "OBJECT_ID": "id",
  "OBJECT_TYPE": "objectType",
  "OPS_STATUS_CODE": "operationalStatus",
  "OWNER": "owner",
  "LAUNCH_DATE": "launchDate",
  "DECAY_DATE": "decayDate",
  "PERIOD": "periodMinutes",
  "INCLINATION": "inclinationDeg",
  "APOGEE": "apogeeKm",
  "PERIGEE": "perigeeKm",

  # Processed columns
  "Class of Orbit": "orbitClass",
  "Type of Orbit": "orbitType",
}

OPS_STATUS_CODE_MAPPING = {
  "+": "OP",
  "-": "NON_OP",
  "P": "PART_OP",
  "B": "STANDBY",
  "S": "SPARE",
  "X": "EXTENDED",
  "D": "DECAYED",
  "" : "UNKNOWN",
  "?": "UNKNOWN",
}

def ucs_to_standard(ucs):
  ucs = ucs.fillna('').copy() # Avoid view vs. copy issues
  
  # Combine all sources columns into one
  sources = ucs.filter(regex='^Source$|^Source.[0-9]+$').fillna('')
  
  # Removes all empty strings and aggregates to list
  tmp = sources.apply(lambda x: list(filter(None, x.tolist())), axis=1)

  # Insert column with new name
  ucs["Sources"] = pd.Series(tmp, dtype=object)

  # TODO: Should we split owners list up?
  # TODO: Either way, convert owners into standard format

  # Split Users and Purpose into lists
  ucs["Users"] = ucs["Users"].apply(lambda x: x.split('/'))
  ucs["Purpose"] = ucs["Purpose"].apply(lambda x: x.split('/'))

  # Filter to only relevant rows and rename
  return ucs[UCS_MAPPING.keys()].rename(columns=UCS_MAPPING)


def satcat_to_standard(satcat):
  satcat = satcat.fillna("").copy() # Avoid view vs. copy issues

  # (Assume that orbit class/type have already been appended)

  # Remove entries not around Earth
  satcat = satcat[satcat["ORBIT_CENTER"] == "EA"]

  # Remove entries without a COSPAR number/apogee/perigee/inclination
  has_cospar = satcat["OBJECT_ID"] != ""
  has_apogee = satcat["APOGEE"] != ""
  has_perigee = satcat["PERIGEE"] != ""
  has_inc = satcat["INCLINATION"] != ""
  satcat = satcat[has_cospar & has_apogee & has_perigee & has_inc]

  # Rename status codes
  satcat["OPS_STATUS_CODE"] = satcat["OPS_STATUS_CODE"].apply(lambda x: OPS_STATUS_CODE_MAPPING[x])

  # Filter to only relevant rows and rename
  return satcat[SATCAT_MAPPING.keys()].rename(columns=SATCAT_MAPPING)


# ucs = pd.read_excel("UCS-Satellite-Database-9-1-2021.xls")
# std = ucs_to_standard(ucs)
# std.to_csv("test.csv")

# satcat = pd.read_csv("satcat_with_orbits.csv")
# std = satcat_to_standard(satcat)
# std.to_csv("test.csv")