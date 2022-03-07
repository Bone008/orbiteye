import './SateliteDetailPanel.css'
import { SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import { ACTIVE_OPERATIONAL_STATUS_SET, OperationalStatus, Satellite } from '../model/satellite';
import { OWNER_SHORT_CODE_TO_FULL, ORBIT_TYPE_CODE_TO_FULL_NAME } from '../model/mapping'
import { formatISODate } from '../util/util';
import { BoxArrowUp } from './Icons';

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

      <div className='DetailRow'>
        <p className='DetailRowLabel'>
          <span className='label help' title='This is an international identifier assigned to artificial objects in space by the UN Committee on Space Research.'>International ID: </span>
        </p>
        <p className='DetailRowValue'>{sat.id}</p>
        <a className='DetailRowValue' href={'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=' + encodeURIComponent(sat.id)} target='_blank'>NASA<BoxArrowUp />
        </a>
      </div>


      <div className='DetailRow'>
        <p className='DetailRowLabel'>Name: </p>
        <p className='DetailRowValue'>{sat.name}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Launch date: </p>
        <p className='DetailRowValue'>{formatISODate(sat.launchDate)}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Status: </p>
        <p className='DetailRowValue'>{OP_STATUS_LABELS[sat.operationalStatus] +
          (sat.decayDate ? ' at ' + formatISODate(sat.decayDate) : '')}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Orbit Type: </p>
        <p className='DetailRowValue'>{ORBIT_TYPE_CODE_TO_FULL_NAME[sat.orbitClass]}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Sector: </p>
        {sat.users.length > 0 &&
          <p className='DetailRowValue'>{sat.users + ' '}</p>
        }
        {sat.users.length == 0 &&
          <p className='DetailRowValue'>{'Unkown'}</p>
        }
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Purpose: </p>
        {sat.purpose.length > 0 &&
          <p className='DetailRowValue'>{sat.purpose + ' '}</p>
        }
        {sat.purpose.length == 0 &&
          <p className='DetailRowValue'>{'Unkown'}</p>
        }
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Owner: </p>
        <p className='DetailRowValue'>{OWNER_SHORT_CODE_TO_FULL[sat.owner]}</p>
      </div>
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
