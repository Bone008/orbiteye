import './SateliteDetailPanel.css'
import { SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon, InfoCircleIcon } from './Icons';
import { OperationalStatus, OrbitClass, Satellite } from '../model/satellite';
import { OWNER_SHORT_CODE_TO_FULL, ORBIT_TYPE_CODE_TO_FULL_NAME } from '../model/mapping'
import { formatDuration, formatISODate } from '../util/util';
import { BoxArrowUp } from './Icons';

export interface DetailPanelProps {
  satellite: Satellite | null;
  showDetail: boolean;
  setShowDetail: React.Dispatch<SetStateAction<boolean>>;
  openOrbitExplainer: (orbitPage?: OrbitClass) => void;
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

  return (
    <div className='MainDetailPanel'>
      <button type="button" className='DetailButton' onClick={openDetails}>See satellite details {Arrow()}
      </button>
      {props.showDetail ?
        <DetailComponent {...props} />
        : null}
    </div>
  );
}

function DetailComponent(props: DetailPanelProps) {
  const sat = props.satellite;
  if (!sat) {
    return <div className='NoSelection'>No satellite selected.</div>;
  }

  const nasaLink = 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=' + encodeURIComponent(sat.id);

  return (
    <div className="DetailDiv">
      <div className='DetailTitle'>
        <span title={'International ID (COSPAR): ' + sat.id}>{sat.name}</span>
      </div>

      <div className='DetailRow subtitle'>
        <div className='DetailRowValue'>
          launched {formatISODate(sat.launchDate)}, {
            OP_STATUS_LABELS[sat.operationalStatus] +
            (sat.decayDate ? ' at ' + formatISODate(sat.decayDate) : '')}
        </div>
      </div>

      <div className='DetailRow spacer'>
        <div className='DetailRowLabel'>Orbit type</div>
        <div className='DetailRowValue'>
          {ORBIT_TYPE_CODE_TO_FULL_NAME[sat.orbitClass]}
          <InfoCircleIcon className='infoIcon' onClick={() => props.openOrbitExplainer(sat.orbitClass)} />
          {/*(sat.orbitType ? ` (${sat.orbitType})` : '')*/}
        </div>
      </div>

      <div className='DetailRow'>
        <div className='DetailRowLabel'>Orbit period</div>
        <div className='DetailRowValue'>
          {formatDuration(sat.periodMinutes)}
          {/* sat.perigeeKm + ' - ' + sat.apogeeKm */}</div>
      </div>

      <div className='DetailRow spacer'>
        <div className='DetailRowLabel'>Owner</div>
        <div className='DetailRowValue'>{OWNER_SHORT_CODE_TO_FULL[sat.owner] || sat.owner}</div>
      </div>

      <div className='DetailRow'>
        <div className='DetailRowLabel'>Sector</div>
        <div className='DetailRowValue'>{sat.users.join(', ') || 'unknown'}</div>
      </div>

      <div className='DetailRow'>
        <div className='DetailRowLabel'>Purpose</div>
        <div className='DetailRowValue'>
          {sat.purpose.join(', ') || 'unknown'}
          {sat.detailedPurpose ? <>
            <br />
            <span className='comments'>{sat.detailedPurpose}</span>
          </> : null}</div>
      </div>

      <div className='DetailRow'>
        <div className='DetailRowLabel'>More info</div>
        <div className='DetailRowValue'>
          {[nasaLink, ...sat.sources].map(link => <SourceLink link={link} />)}
          {sat.comments ? <>
            <br />
            <span className='comments'>{sat.comments}</span>
          </> : null}
        </div>
      </div>
    </div>
  );
}

function SourceLink({ link }: { link: string }) {
  let label = 'External link';
  try {
    label = new URL(link).hostname.toLowerCase();
    if (label.endsWith('.nasa.gov')) {
      label = 'NASA';
    }
    else if (label.startsWith('www.')) {
      label = label.substr(4);
    }
  } catch (e) { }

  return (
    <a
      className='sourceLink'
      href={link}
      target='_blank'
      rel='noreferrer'>
      {label}&nbsp;<BoxArrowUp />
    </a>
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
  UNKNOWN: 'unknown status',
};
