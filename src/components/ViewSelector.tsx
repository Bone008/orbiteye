import './ViewSelector.css';

const viewOptions = [
  {
    name: "Orbits",
    description: "Description of orbits here",
    href: "#/orbits/globe",
  },
  {
    name: "Origin",
    description: "Description of origin here",
    href: "#/origin",
  },
  {
    name: "Launch",
    description: "Description of launch here",
    href: "#",
  },
  {
    name: "Decay",
    description: "Description of decay here",
    href: "#",
  },
];

export default function ViewSelector() {
  const options = viewOptions.map(option => {
    return (
      <a key={option.name} className="optionContainer" href={option.href}>
        <div>
          <p className='optionTitle'>{option.name}</p>
          <p className='optionDescription'>{option.description}</p>
        </div>
      </a>
    );
  });

  return (
    <div className="ViewSelector">
      {options}
    </div>
  );
}