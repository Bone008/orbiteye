import './SateliteDetailPanel.css'
import { SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import { ACTIVE_OPERATIONAL_STATUS_SET, OperationalStatus, Satellite } from '../model/satellite';
import { formatISODate } from '../util/util';

export interface DetailPanelProps {
  satellite: Satellite | null;
  showDetail: boolean;
  setShowDetail: React.Dispatch<SetStateAction<boolean>>;
}


export default function SateliteDetailPanel(props: DetailPanelProps) {

  const openDetails = () => {
    props.setShowDetail(!props.showDetail)
  };

  const Arrow = () => {
    if (props.showDetail) {
      return <ChevronDownIcon />
    } else {
      return <ChevronUpIcon />
    }
  }

  /*Main functionality is there, need to clean up the style and figure out the poition. Also fix nice transition between open and closed detail view. */
  return (
    <div className='MainDetailPanel'>
      <button type="button" className='DetailButton' onClick={openDetails}>See satellite details {Arrow()}
      </button>
      {props.showDetail ?
        <DetailComponent sat={props.satellite} />
        : null}
    </div>
  );
}

/**Fix styling is needed */
function DetailComponent({ sat }: { sat: Satellite | null }) {
  if (!sat) {
    return <div className='NoSelection'>No satellite selected.</div>;
  }

  return (
    <div className="DetailDiv">
      <p className='DetailRowText'>
        <span className='label help' title='This is an international identifier assigned to artificial objects in space by the UN Committee on Space Research.'>COSPAR ID: </span>
        <a href={'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=' + encodeURIComponent(sat.id)} target='_blank'>{sat.id}</a>
      </p>
      <p className='DetailRowText'>Name: {sat.name}</p>
      <p className='DetailRowText'>Launch date: {formatISODate(sat.launchDate)}</p>
      <p className='DetailRowText'>Status: {OP_STATUS_LABELS[sat.operationalStatus] +
        (sat.decayDate ? ' at ' + formatISODate(sat.decayDate) : '')}</p>
    </div>
  );
}

const OP_STATUS_LABELS: Record<OperationalStatus, string> = {
  OP: 'operational',
  PART_OP: 'operational',
  EXTENDED: 'operational',
  SPARE: 'operational',
  STANDBY: 'operational',
  NON_OP: 'non-operational',
  DECAYED: 'decayed',
  UNKNOWN: 'unknown',
};
