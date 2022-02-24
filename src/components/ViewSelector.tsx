import { Link } from 'react-router-dom';
import './ViewSelector.css';

const viewOptions = [
  {
    name: "Orbits",
    description: "In this mode, you will be able to see an overview of the different types of orbits and their satellites.",
    href: "/orbits/globe",
  },
  {
    name: "Origin",
    description: "In this mode, you will be able to see the most active countries in launching or active satellites throughout history.",
    href: "/origin",
  },
  {
    name: "Launch",
    description: "In this mode, you will see all the launch sites used depending on their interests.",
    href: "/",
  },
  {
    name: "Decay",
    description: "In this mode, you will be able to point out the increase of debris number over the years.",
    href: "/",
  },
];

export default function ViewSelector() {
  const options = viewOptions.map(option => {
    return (
      <Link key={option.name} className="optionContainer" to={option.href}>
        <div>
          <p className='optionTitle'>{option.name}</p>
          <p className='optionDescription'>{option.description}</p>
        </div>
      </Link>
    );
  });

  return (
    <div className="ViewSelector">
      {options}
    </div>
  );
}