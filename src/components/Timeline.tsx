import './Timeline.css';
import {
  useMemo,
  useState
} from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';


export interface TimelineProps {
  allSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

/** React component to render the timeline and date range selection UI. */
export default function Timeline(props: TimelineProps) {


  // Use memoization to make sure this is only computed once.
  const [datasetMinDate, datasetMaxDate] = useMemo(() => {
    const launchDates = props.allSatellites.map(sat => sat.launchDate);
    return d3.extent(launchDates);
  }, [props.allSatellites]);

  const changeSelectedRange = () => {
    const newFilter = props.filterSettings.update({
      // TODO: replace hard-coded values with user selection
      minDate: props.filterSettings.filter.minDate ? undefined : new Date('2000-01-01'),
      maxDate: props.filterSettings.filter.minDate ? undefined : new Date('2020-12-31'),
    });

    console.log("filter")
    props.onUpdateFilter(newFilter);
  };

  const currentFilter = props.filterSettings.filter;
  const minDate = currentFilter.minDate || datasetMinDate;
  const maxDate = currentFilter.maxDate || datasetMaxDate;

  const [rangeValue, setRangeValue] = useState<number[]>(() => {
    const min = datasetMinDate?.getFullYear() as number
    const max = datasetMaxDate?.getFullYear() as number //Currently is undefined in the begining of the render. 
    return [min, max]
  });

  /*The slider component uses this onChange to set nuew values when the thumbs are moved*/
  const rangeChange = (e: Event, input: number | number[]) => {
    setRangeValue(input as number[]);
    changeSelectedRange();
  };

  return (
    <div className='SliderContainer'>
      <CustomSlider
        value={rangeValue}
        min={1957}
        max={2022}
        marks={marks}
        onChange={rangeChange}
        valueLabelDisplay="on"
      />
    </div>
  )
}

// Hard coded for now, could be created based on dataset+
const marks = [{
  value: 1960,
  label: '1960',
},
{
  value: 1970,
  label: '1970',
},
{
  value: 1980,
  label: '1980',
},
{
  value: 1990,
  label: '1990',
},
{
  value: 2000,
  label: '2000',
},
{
  value: 2010,
  label: '2010',
},
{
  value: 2020,
  label: '2020',
}
];

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