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

OBJECT_TYPE_MAPPING = {
  "PAY": "PAYLOAD",
  "R/B": "ROCKET",
  "DEB": "DEBRIS",
  "UNK": "UNKNOWN",
}

UCS_PURPOSE_TYPOS = {
  "Communication": "Communications",
  "Earth": "Earth Observation",
  "Earth Observarion": "Earth Observation",
}

def ucs_simplify_purpose(purpose_list):
  # Navigation is too broad and redundant -- let's remove it
  new_list = [p for p in purpose_list if p != "Navigation"]

  # TODO: rename labels in some sensible way
  return new_list


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
  ucs["Users"] = ucs["Users"].apply(lambda x: [str.strip(u) for u in x.split('/')])
  ucs["Purpose"] = ucs["Purpose"].apply(lambda x: [str.strip(p) for p in x.split('/')])

  ucs["Purpose"] = ucs["Purpose"].apply(lambda x: [UCS_PURPOSE_TYPOS.get(p, p) for p in x])
  ucs["Purpose"] = ucs["Purpose"].apply(ucs_simplify_purpose)

  # Filter to only relevant rows and rename
  std = ucs[UCS_MAPPING.keys()].rename(columns=UCS_MAPPING)
  std["id"].apply(str.strip)

  return std


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

  # Rename enums
  satcat["OPS_STATUS_CODE"] = satcat["OPS_STATUS_CODE"].apply(lambda x: OPS_STATUS_CODE_MAPPING[x])
  satcat["OBJECT_TYPE"] = satcat["OBJECT_TYPE"].apply(lambda x: OBJECT_TYPE_MAPPING[x])

  # Filter to only relevant rows and rename
  std = satcat[SATCAT_MAPPING.keys()].rename(columns=SATCAT_MAPPING)
  std["id"].apply(str.strip)

  return std


def merge_group(df):
  df = df.fillna('')

  # Reset indexes so that they can be combined later
  satcat = df[df["dataSource"] == "SATCAT"].reset_index(drop=True)
  ucs = df[df["dataSource"] == "UCS"].reset_index(drop=True)

  # Confirm there is a SATCAT row for this id
  if satcat.shape[0] == 0 or (satcat["id"] == '').any():
    return None
  
  # If there is only SATCAT, just use that
  if ucs.shape[0] == 0:
    return satcat

  # Default to SATCAT
  combined = satcat.copy()
  combined["dataSource"] = "UCS/SATCAT"

  UCS_OVERRIDE = ["name", "users", "purpose", "detailedPurpose", "launchMassKg", "comments", "sources"]
  for col in UCS_OVERRIDE:
    combined[col] = ucs[col]

  return combined



def merge(ucs_std, satcat_std):
  # Start with source labels and reduce from there
  ucs_std["dataSource"] = "UCS"
  satcat_std["dataSource"] = "SATCAT"
  df = pd.concat([satcat_std, ucs_std])

  # Filter out certain rows
  df = df[df["orbitType"] != "Cislunar"]

  groups = df.groupby("id")
  final = groups.apply(merge_group)
  
  return final



ucs = pd.read_excel("UCS-Satellite-Database-9-1-2021.xls")
ucs_std = ucs_to_standard(ucs)
# std.to_csv("test.csv")

satcat = pd.read_csv("satcat_with_orbits.csv")
satcat_std = satcat_to_standard(satcat)
# std.to_csv("test.csv")

final = merge(ucs_std, satcat_std)
# final.to_csv("test.csv")
final.to_json("satellites.json", orient="records")