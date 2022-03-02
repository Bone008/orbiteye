import './SateliteDetailPanel.css'
import { SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './Icons';


/**Fix styling is needed */
const DetailComponent = ({ data, showDetail }: { data: DetailPanelProps, showDetail: Boolean }) => {
  return (showDetail ?
    <div className="DetailDiv">
      <p className='DetailRowText'>Name: {data.name}</p>
      <p className='DetailRowText'>Launch date: {data.launchDate}</p>
      <p className='DetailRowText'>Status: {data.status}</p>
    </div> : null
  );
}

export interface DetailPanelProps {
  name?: string;
  launchDate?: string;
  status?: string;
  showDetail: boolean;
  setShowDetail: React.Dispatch<SetStateAction<boolean>>;
}


export default function SateliteDetailPanel(props: DetailPanelProps) {

  const OpenDetails = () => {
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
  if (props.name != undefined) {
    return (
      <div className='MainDetailPanel'>
        <button type="button" className='DetailButton' onClick={OpenDetails}>See satellite details {Arrow()}
        </button>
        <DetailComponent data={props} showDetail={props.showDetail} />
      </div>
    )
  } else {
    return <div></div>
  }

}