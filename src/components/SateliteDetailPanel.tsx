import './SateliteDetailPanel.css'
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './Icons';


/**Fix styling is needed.  */
const DetailComponent = ({ data, showDetail }: { data: DetailPanelProps, showDetail: any }) => {
  return (showDetail ?
    <div className="DetalPanel">
      <p className='DetailRowText'>Name: {data.name}</p>
      <p className='DetailRowText'>Launch date: {data.launchDate}</p>
      <p className='DetailRowText'>Status: {data.status}</p>
    </div> : null);
}

export interface DetailPanelProps {
  name: string;
  launchDate: string;
  status: string;
}

/*Test data to show in the panel. Will be deleted later for actual data */
const test: DetailPanelProps = {
  name: 'Name A',
  launchDate: '2022-02-26',
  status: 'Operational'
}


export default function SateliteDetailPanel() {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const OpenDetails = () => {
    setShowDetail(!showDetail)
  };

  const Arrow = () => {
    if (showDetail) {
      return <ChevronDownIcon />
    } else {
      return <ChevronUpIcon />
    }
  }

  /*Main functionality is there, need to clean up the style and figure out the poition. Also fix nice transition between open and closed detail view. */
  return (
    <div className='DetailPanel'>
      <button type="button" className='DetailButton' onClick={OpenDetails}>See satellite details {Arrow()}
      </button>
      <DetailComponent data={test} showDetail={showDetail} />
    </div>
  )
}