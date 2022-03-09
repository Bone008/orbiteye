import './Timeline.css';
import {
  useEffect,
  useMemo,
  useState
} from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

/** Time in milliseconds to delay updating the filter after the slider has been dragged. */
const DEBOUNCE_FILTER_UPDATE_MS = 400;
const FALLBACK_DATE_RANGE = { min: 1957, max: 2022 };
const MARK_STEP_SIZE_YEARS = 5;

let globalUpdateTimeoutId = 0;

export interface TimelineProps {
  allSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

/** React component to render the timeline and date range selection UI. */
export default function Timeline(props: TimelineProps) {

  // Use memoization to make sure this is only computed once.
  const [datasetMinYear, datasetMaxYear] = useMemo(() => {
    const [min, max] = d3.extent(props.allSatellites, sat => sat.launchDate);
    return [min?.getFullYear() || 0, max?.getFullYear() || 0];
  }, [props.allSatellites]);

  const changeSelectedRange = (minYear: number, maxYear: number) => {
    const newFilter = props.filterSettings.update({
      // Performance optimization: If equal to range boundary, set to null.
      // Use timestamps directly because comparing Date objects is apparently very slow.
      minLaunchTimestamp: minYear === datasetMinYear ? null : new Date(minYear, 0, 1).getTime(),
      maxLaunchTimestamp: maxYear === datasetMaxYear ? null : new Date(maxYear, 11, 31).getTime(),
    });
    props.onUpdateFilter(newFilter);
  };

  const currentFilter = props.filterSettings.filter;
  const currentMinYear = currentFilter.minLaunchTimestamp ? new Date(currentFilter.minLaunchTimestamp).getFullYear() : datasetMinYear;
  const currentMaxYear = currentFilter.maxLaunchTimestamp ? new Date(currentFilter.maxLaunchTimestamp).getFullYear() : datasetMaxYear;

  const [rangeSliderValue, setRangeSliderValue] = useState<[number, number]>([currentMinYear, currentMaxYear]);
  // Reset to max range whenever the underlying data changes.
  useEffect(() => setRangeSliderValue([datasetMinYear, datasetMaxYear]), [datasetMinYear, datasetMaxYear]);

  /*The slider component uses this onChange to set new values when the thumbs are moved*/
  const rangeChange = (e: Event, input: number | number[]) => {
    const [min, max] = input as [number, number];
    setRangeSliderValue([min, max]);

    window.clearTimeout(globalUpdateTimeoutId);
    globalUpdateTimeoutId = window.setTimeout(() => {
      changeSelectedRange(min, max);
    }, DEBOUNCE_FILTER_UPDATE_MS);
  };

  const marks = useMemo(() => calculateMarks(datasetMinYear, datasetMaxYear), [datasetMinYear, datasetMaxYear]);

  // Do not actually render the slider before the data is loaded to avoid showing it without a valid extent.
  if (!props.allSatellites.length) {
    return null;
  }

  return (
    <div className='SliderContainer'>
      <CustomSlider
        value={rangeSliderValue}
        min={datasetMinYear}
        max={datasetMaxYear}
        marks={marks}
        onChange={rangeChange}
        valueLabelDisplay="on"
      />
    </div>
  )
}

function calculateMarks(minYear: number, maxYear: number) {
  // Round up to nearest decade.
  const firstMark = minYear % MARK_STEP_SIZE_YEARS === 0 ? minYear : minYear + MARK_STEP_SIZE_YEARS - (minYear % MARK_STEP_SIZE_YEARS);
  // Round down to nearest decade.
  const lastMark = maxYear - (maxYear % MARK_STEP_SIZE_YEARS);

  return d3.range(firstMark, maxYear + 1, MARK_STEP_SIZE_YEARS).map(value => ({ value, label: String(value) }));
}

/**Styling for the slider, using styled from Material UI https://mui.com/system/styled/ */
const CustomSlider = styled(Slider)(() => ({
  color: 'white',
  height: 2,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 'small',
    fontWeight: 'normal',
    top: 2,
    backgroundColor: 'unset',
    color: 'white',
    '&:before': {
      display: 'none',
    },
    '& *': {
      background: 'none',
      color: 'white',
    },
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: 'white',
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'white',
    height: 8,
    width: 1,
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: 'currentColor',
    },
  },
  '& .MuiSlider-markLabel': {
    fontSize: 'small',
    fontWeight: 'normal',
    color: 'white'
  }
}));