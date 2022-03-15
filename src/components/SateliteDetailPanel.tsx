import './SateliteDetailPanel.css'
import { SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import { OperationalStatus, Satellite } from '../model/satellite';
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

  const ButtonDirection = () => {
    if (props.showDetail) {
      return <ChevronDownIcon />
    } else {
      return <ChevronUpIcon />
    }
  }

  /*{ButtonDirection()}*/

  return (
    <div className='MainDetailPanel'>
      <button type="button" className='DetailButton' onClick={openDetails}>{(props.showDetail ? 'Hide satellite details ' : 'See satellite details ')} {ButtonDirection()}
      </button>

      <div className="detailsTest">
        {props.showDetail ?
          <DetailComponent sat={props.satellite} />
          : null}
      </div>

    </div>
  );
}

function DetailComponent({ sat }: { sat: Satellite | null }) {
  if (!sat) {
    return <div className='NoSelection'>No satellite selected.</div>;
  }

  return (
    <div className="DetailDiv">
      <div className='DetailHeaderRow'>
        <h2 className='DetailHeader'>{sat.name}</h2>
      </div>

      <div className='DetailSubHeader'>
        <p className='DetailSubHeaderValue'>
          <span className='label help' title='This is an international identifier assigned to artificial objects in space by the UN Committee on Space Research.'>International ID: </span>
          {sat.id}
          <a href={'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=' + encodeURIComponent(sat.id)} target='_blank' rel="noreferrer">NASA<BoxArrowUp />
          </a>
        </p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Orbit Type: </p>
        <p className='DetailRowValue'>{ORBIT_TYPE_CODE_TO_FULL_NAME[sat.orbitClass]}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Status: </p>
        <p className='DetailRowValue'>{OP_STATUS_LABELS[sat.operationalStatus] +
          (sat.decayDate ? ' at ' + formatISODate(sat.decayDate) : '')}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Owner: </p>
        <p className='DetailRowValue'>{OWNER_SHORT_CODE_TO_FULL[sat.owner]}</p>
      </div>


      <div className='DetailRow'>
        <p className='DetailRowLabel'>Launch date: </p>
        <p className='DetailRowValue'>{formatISODate(sat.launchDate)}</p>
      </div>

      <div className='DetailRow'>
        <p className='DetailRowLabel'>Sector: </p>
        {sat.users.length > 0 &&
          <p className='DetailRowValue'>{sat.users + ' '}</p>
        }
        {sat.users.length === 0 &&
          <p className='DetailRowValue'>{'Unkown'}</p>
        }
      </div>


      <div className='DetailRow'>
        <p className='DetailRowLabel'>Purpose: </p>
        {sat.purpose.length > 0 &&
          <p className='DetailRowValue'>{sat.purpose + ' '}</p>
        }
        {sat.purpose.length === 0 &&
          <p className='DetailRowValue'>{'Unkown'}</p>
        }
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
