import { useEffect, useMemo, useRef } from 'react';
import { upcomingEvents, formatEventDate, type NutGuyEvent } from '../data/events';
import './schedule.css';

/**
 * "Where's the Nut Guy?" — the live appearance schedule.
 *
 * The one cool-blue room in the journey: Minnesota State Fair at dusk, warm
 * gold bulbs twinkling over the midway. Reads from src/data/events.ts, which
 * is the single source of truth for every "find us in person" surface.
 */

type Bulb = {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
};

/**
 * Hand-scattered midway bulbs. Fixed (not Math.random) so the field is stable
 * across re-renders — the twinkle irregularity comes from the varied
 * delay/duration pairs, not from randomized layout.
 */
const BULBS: Bulb[] = [
  { left: '4%', top: '12%', size: 6, delay: '0ms', duration: '4200ms' },
  { left: '11%', top: '31%', size: 4, delay: '1300ms', duration: '5600ms' },
  { left: '17%', top: '7%', size: 9, delay: '2600ms', duration: '3900ms' },
  { left: '23%', top: '58%', size: 5, delay: '700ms', duration: '6100ms' },
  { left: '29%', top: '19%', size: 7, delay: '3400ms', duration: '4700ms' },
  { left: '35%', top: '82%', size: 4, delay: '1900ms', duration: '5200ms' },
  { left: '41%', top: '5%', size: 5, delay: '4100ms', duration: '3600ms' },
  { left: '47%', top: '44%', size: 8, delay: '900ms', duration: '6400ms' },
  { left: '52%', top: '15%', size: 4, delay: '2200ms', duration: '4400ms' },
  { left: '58%', top: '71%', size: 6, delay: '3100ms', duration: '5000ms' },
  { left: '63%', top: '27%', size: 5, delay: '500ms', duration: '5800ms' },
  { left: '69%', top: '9%', size: 9, delay: '2800ms', duration: '4100ms' },
  { left: '74%', top: '52%', size: 4, delay: '1600ms', duration: '6200ms' },
  { left: '79%', top: '88%', size: 6, delay: '3700ms', duration: '4600ms' },
  { left: '84%', top: '22%', size: 7, delay: '1100ms', duration: '5400ms' },
  { left: '89%', top: '63%', size: 4, delay: '4400ms', duration: '3800ms' },
  { left: '93%', top: '36%', size: 8, delay: '200ms', duration: '6600ms' },
  { left: '96%', top: '78%', size: 5, delay: '2400ms', duration: '4900ms' },
  { left: '8%', top: '69%', size: 7, delay: '3900ms', duration: '5100ms' },
  { left: '66%', top: '95%', size: 5, delay: '1400ms', duration: '4300ms' },
];

const ADDRESS = '7801 Park Dr Ste E, Chanhassen, MN 55317';
const PHONE_DISPLAY = '1-888-449-6887';
const PHONE_HREF = 'tel:+18884496887';

/** How many non-featured stops to list under the marquee card. */
const STOP_LIMIT = 5;

function eventKey(event: NutGuyEvent): string {
  return `${event.venue}-${event.start}`;
}

export default function ScheduleSection() {
  const rootRef = useRef<HTMLElement>(null);

  // Pull the whole remaining season once, then split it: the marquee event gets
  // a hero card, the next handful of stops become the timeline beneath it.
  const { featured, stops, isEmpty } = useMemo(() => {
    const season = upcomingEvents(undefined, 40);
    return {
      featured: season.find((event) => event.featured),
      stops: season.filter((event) => !event.featured).slice(0, STOP_LIMIT),
      isEmpty: season.length === 0,
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="schedule"
      className="schedule relative w-full py-24 md:py-32"
      aria-labelledby="schedule-title"
    >
      <div className="schedule__lights" aria-hidden="true">
        {BULBS.map((bulb) => (
          <span
            key={`${bulb.left}-${bulb.top}`}
            className="schedule__bulb"
            style={{
              left: bulb.left,
              top: bulb.top,
              width: `${bulb.size}px`,
              height: `${bulb.size}px`,
              animationDelay: bulb.delay,
              animationDuration: bulb.duration,
            }}
          />
        ))}
      </div>

      <div className="schedule__inner relative mx-auto w-full max-w-6xl px-4">
        <header className="schedule__head" data-slide="">
          <p className="schedule__eyebrow">On the road</p>
          <h2 id="schedule-title" className="schedule__title">
            Where&rsquo;s the Nut&nbsp;Guy?
          </h2>
          <p className="schedule__lede">
            We do 225+ shows a year across the upper Midwest &mdash; racetracks, county fairs,
            craft shows, and the big one in Falcon Heights. Everything is roasted fresh to
            order, never pre-roasted, so the booth smells like the whole reason you came.
          </p>
          <ul className="schedule__chips">
            <li className="schedule__chip">225+ shows a year</li>
            <li className="schedule__chip">Free samples at the booth</li>
          </ul>
        </header>

        {isEmpty ? (
          <div className="schedule__empty glass" data-slide="">
            <h3 className="schedule__empty-title">Season&rsquo;s wrapped</h3>
            <p className="schedule__empty-copy">
              The tent is folded, the roasters are cooling, and Chippy is asleep somewhere warm.
              We&rsquo;ll be back on the road next summer &mdash; until then, everything still
              ships fresh from Chanhassen.
            </p>
          </div>
        ) : (
          <>
            {featured ? (
              <div className="schedule__feature-wrap" data-slide="">
                <article
                  className="glass schedule__feature"
                  aria-labelledby="schedule-feature-title"
                >
                  <div className="schedule__feature-photo" aria-hidden="true" />
                  <div className="schedule__feature-body">
                    <p className="schedule__flag">
                      <span className="schedule__flag-dot" aria-hidden="true" />
                      Don&rsquo;t miss
                    </p>
                    <time className="schedule__feature-date" dateTime={featured.start}>
                      {formatEventDate(featured)}
                    </time>
                    <h3 id="schedule-feature-title" className="schedule__feature-venue">
                      {featured.venue}
                    </h3>
                    <p className="schedule__feature-city">{featured.city}</p>
                    <p className="schedule__feature-note">
                      Twelve days on the fairgrounds &mdash; our biggest stop of the year, and
                      the one where the line for Secret Peanuts starts before we finish setting
                      up. Come hungry, samples are on us.
                    </p>
                  </div>
                </article>
              </div>
            ) : null}

            {stops.length > 0 ? (
              <>
                <h3 className="schedule__list-title" data-slide="">
                  Next stops
                </h3>
                <ol className="schedule__list">
                  {stops.map((stop) => (
                    <li key={eventKey(stop)} className="schedule__item" data-slide="">
                      <span className="schedule__node" aria-hidden="true" />
                      <time className="schedule__date" dateTime={stop.start}>
                        {formatEventDate(stop)}
                      </time>
                      <div className="schedule__where">
                        <p className="schedule__venue">{stop.venue}</p>
                        <p className="schedule__city">{stop.city}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </>
        )}

        <p className="schedule__footer" data-slide="">
          <span className="schedule__footer-item">{ADDRESS}</span>
          <span className="schedule__footer-sep" aria-hidden="true">
            &middot;
          </span>
          <a className="schedule__footer-link" href={PHONE_HREF}>
            {PHONE_DISPLAY}
          </a>
        </p>
      </div>
    </section>
  );
}
