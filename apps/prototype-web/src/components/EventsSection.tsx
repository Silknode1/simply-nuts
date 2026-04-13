const events = [
  {name: 'Minnesota State Fair', date: 'Aug 22 \u2013 Sep 2', desc: 'Visit booth #247 for free samples'},
  {name: 'Twin Cities Holiday Market', date: 'Nov 14 \u2013 Nov 16', desc: 'Gift sets and corporate ordering desk'},
  {name: 'Corporate Sampling Week', date: 'Oct 6 \u2013 Oct 10', desc: 'Schedule a private tasting'},
  {name: 'Chanhassen Farmers Market', date: 'Every Sat, Jun \u2013 Sep', desc: 'Fresh roasted nuts weekly'}
];

export default function EventsSection() {
  return (
    <section className="events-section" data-reveal>
      <p className="eyebrow">Find Us In Person</p>
      <h2>Upcoming Events</h2>
      <p>Find us at fairs and markets across Minnesota</p>
      <ul className="events-list">
        {events.map((e) => (
          <li key={e.name} className="event-card">
            <span className="event-date">{e.date}</span>
            <div>
              <h3>{e.name}</h3>
              <p>{e.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
