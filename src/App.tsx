import {
  ArrowRight,
  CircleDollarSign,
  Eye,
  Factory,
  Library,
  MousePointer2,
  Route,
  Shuffle,
  SlidersHorizontal,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import './App.css'

type FlowKey = 'cost' | 'supply' | 'ranking' | 'value'
type ScenarioKey = 'low' | 'moderate' | 'high'
type ValueStateKey = 'current' | 'saturated'

type FlowStep = {
  key: FlowKey
  title: string
  short: string
  icon: typeof Factory
  points: string[]
}

type ScenarioLevel = {
  key: ScenarioKey
  label: string
  range: string
  productionCost: string
  trackSupply: string
  attentionPerTrack: string
  rankingPressure: string
  supplyCells: number
  summary: string
  effects: string[]
}

type ValueState = {
  key: ValueStateKey
  label: string
  summary: string
  groups: Array<{
    label: string
    level: 'moderate' | 'high' | 'very high' | 'lower'
    width: number
    note: string
  }>
}

const flowSteps: FlowStep[] = [
  {
    key: 'cost',
    title: 'Lower production cost',
    short: 'AI tools make it easier to produce more tracks with less studio time, labor, and budget.',
    icon: Factory,
    points: [
      'The important change is not one song getting cheaper. It is the number of songs that can be made at scale.',
      'When output becomes easier, the supply side of streaming grows faster than listener time.',
      'Cheap production gives platforms more material to test, rank, and monetize.',
    ],
  },
  {
    key: 'supply',
    title: 'Catalog flood',
    short: 'More tracks compete for the same playlist slots, search results, and listener attention.',
    icon: Library,
    points: [
      'A larger catalog does not create more hours in the day for listeners.',
      'The long tail gets more crowded: each track has to fight harder to be noticed.',
      'The catalog becomes less like a shelf and more like a queue waiting for ranking decisions.',
    ],
  },
  {
    key: 'ranking',
    title: 'Recommendation bottleneck',
    short: 'The platform becomes more powerful because it controls which tracks become visible first.',
    icon: Route,
    points: [
      'Most listeners do not choose from the full catalog. They choose from what search, autoplay, playlists, and feeds surface.',
      'When supply expands, ranking becomes the scarce pathway to attention.',
      'The platform can learn from every skip, replay, save, and mood playlist decision.',
    ],
  },
  {
    key: 'value',
    title: 'Value capture',
    short: 'More listening activity does not guarantee more leverage for individual artists.',
    icon: CircleDollarSign,
    points: [
      'Platforms benefit from more content because more content means more data, more tests, and more ways to keep listeners inside the system.',
      'Rights holders with large catalogs can still negotiate from scale.',
      'Individual artists can face thinner visibility even when the system as a whole has more tracks and more engagement.',
    ],
  },
]

const scenarioLevels: ScenarioLevel[] = [
  {
    key: 'low',
    label: 'Low AI production pressure',
    range: '0-34',
    productionCost: 'higher',
    trackSupply: 'contained',
    attentionPerTrack: 'less crowded',
    rankingPressure: 'lower',
    supplyCells: 10,
    summary: 'Production is still limited enough that supply grows slowly.',
    effects: [
      'Fewer tracks compete for the same playlist slots.',
      'A listener has a better chance of encountering the same release more than once.',
      'Ranking still matters, but it is not carrying the whole market.',
    ],
  },
  {
    key: 'moderate',
    label: 'Moderate AI production pressure',
    range: '35-69',
    productionCost: 'falling',
    trackSupply: 'growing',
    attentionPerTrack: 'thinning',
    rankingPressure: 'rising',
    supplyCells: 22,
    summary: 'Production gets easier, so more similar tracks enter the same listening lanes.',
    effects: [
      'Supply starts to outpace listener attention.',
      'Discovery depends more on recommendation surfaces.',
      'Tracks that fit stable moods or background listening become easier to test at scale.',
    ],
  },
  {
    key: 'high',
    label: 'High AI production pressure',
    range: '70-100',
    productionCost: 'very low',
    trackSupply: 'flooded',
    attentionPerTrack: 'scarce',
    rankingPressure: 'high',
    supplyCells: 34,
    summary: 'Abundant production makes attention the main scarce resource.',
    effects: [
      'Many tracks compete for the same small pool of listener time.',
      'Visibility depends heavily on search, autoplay, playlists, and feed placement.',
      'The platform gains leverage because it controls the bottleneck between supply and attention.',
    ],
  },
]

const valueStates: ValueState[] = [
  {
    key: 'current',
    label: 'Current streaming model',
    summary:
      'Streaming already concentrates power around distribution, discovery, and catalog ownership.',
    groups: [
      {
        label: 'Platform',
        level: 'high',
        width: 68,
        note: 'Controls interface placement, recommendation data, subscriptions, and advertising.',
      },
      {
        label: 'Catalog owners',
        level: 'moderate',
        width: 50,
        note: 'Benefit from rights ownership, licensing scale, and back catalog leverage.',
      },
      {
        label: 'Individual artists',
        level: 'moderate',
        width: 44,
        note: 'Can still gain traction, but discovery depends on visibility inside platform systems.',
      },
    ],
  },
  {
    key: 'saturated',
    label: 'AI-saturated model',
    summary:
      'When track supply expands quickly, ranking and catalog control become even more important.',
    groups: [
      {
        label: 'Platform',
        level: 'very high',
        width: 86,
        note: 'Gets more content to test, more behavior data, and more control over what reaches listeners.',
      },
      {
        label: 'Catalog owners',
        level: 'high',
        width: 64,
        note: 'Large catalogs can absorb attention across many tracks and negotiate from scale.',
      },
      {
        label: 'Individual artists',
        level: 'lower',
        width: 30,
        note: 'Face more crowding, thinner attention per track, and greater dependence on ranking systems.',
      },
    ],
  },
]

const worksSampled = [
  'McNamee, Noah. Artificial Intelligence and the Redistribution of Value in the Digital Music Economy. Writing 101, 2026.',
  'McNamee, Noah. Dossier for the Multimodal Remix. Writing 101, 23 Apr. 2026.',
  'Christian, Bryce M. Accessible cultural experience design research. University of South Carolina, 2025.',
  'Huang, Jiaying, and Wenhua Li. User experience and display design research. Springer, 2024.',
  'Meng, Lei, et al. Audience experience and display narrative research. Electronics, 2022.',
  'Wang, Zezhong, et al. Data comics and infographic engagement research. ACM, 2019.',
]

const attentionTokens = Array.from({ length: 12 }, (_, index) => index)
const supplyTokens = Array.from({ length: 36 }, (_, index) => index)

function getScenario(aiLevel: number) {
  if (aiLevel < 35) return scenarioLevels[0]
  if (aiLevel < 70) return scenarioLevels[1]
  return scenarioLevels[2]
}

function App() {
  const [activeStep, setActiveStep] = useState<FlowKey>('cost')
  const [aiLevel, setAiLevel] = useState(50)
  const [valueStateKey, setValueStateKey] = useState<ValueStateKey>('current')

  const activeFlow = flowSteps.find((step) => step.key === activeStep) ?? flowSteps[0]
  const scenario = useMemo(() => getScenario(aiLevel), [aiLevel])
  const valueState = valueStates.find((state) => state.key === valueStateKey) ?? valueStates[0]

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="The Platform Machine">
          <span className="brand-mark" aria-hidden="true">
            PM
          </span>
          <span>
            <strong>The Platform Machine</strong>
            <span className="brand-subtitle">AI music and platform power</span>
          </span>
        </a>
        <nav className="top-nav" aria-label="Page sections">
          <a href="#flow">Flow</a>
          <a href="#scenario">Scenario</a>
          <a href="#value">Value</a>
          <a href="#takeaway">Takeaway</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-grid" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="kicker">Standalone system model</p>
            <h1 id="page-title">AI music does not just add songs. It shifts power.</h1>
            <p>
              When production gets cheaper, supply can grow faster than listener attention. That
              makes ranking, recommendation, and catalog ownership more powerful.
            </p>
          </div>

          <section className="flow-panel" id="flow" aria-labelledby="flow-title">
            <div className="section-heading">
              <p className="kicker">Causal chain</p>
              <h2 id="flow-title">Follow the bottleneck</h2>
            </div>
            <div className="chevron-flow" role="tablist" aria-label="Platform power flow">
              {flowSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <button
                    className={step.key === activeStep ? 'active' : ''}
                    type="button"
                    role="tab"
                    aria-selected={step.key === activeStep}
                    key={step.key}
                    onClick={() => setActiveStep(step.key)}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <Icon size={18} />
                    <strong>{step.title}</strong>
                  </button>
                )
              })}
            </div>
            <article className="flow-detail">
              <div>
                <h3>{activeFlow.title}</h3>
                <p>{activeFlow.short}</p>
              </div>
              <ul>
                {activeFlow.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </section>
        </section>

        <section className="scenario-grid" id="scenario" aria-labelledby="scenario-title">
          <div className="control-panel">
            <p className="kicker">Scenario control</p>
            <h2 id="scenario-title">Move production pressure and watch scarcity move.</h2>
            <p>
              This slider is a scenario setting, not an industry statistic. It shows the
              direction of the system: cheaper production raises supply, and fixed listener
              attention makes ranking more important.
            </p>
            <label className="range-control">
              <span>
                AI production pressure
                <strong>{scenario.label}</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={aiLevel}
                onChange={(event) => setAiLevel(Number(event.target.value))}
              />
            </label>
            <div className="stepper-control" role="group" aria-label="Adjust AI production pressure">
              <button type="button" onClick={() => setAiLevel(Math.max(0, aiLevel - 20))}>
                Lower
              </button>
              <button type="button" onClick={() => setAiLevel(Math.min(100, aiLevel + 20))}>
                Raise
              </button>
            </div>
          </div>

          <div className="scenario-board">
            <div className="state-strip" aria-label="Scenario indicators">
              <Indicator label="Production cost" value={scenario.productionCost} />
              <Indicator label="Track supply" value={scenario.trackSupply} />
              <Indicator label="Attention per track" value={scenario.attentionPerTrack} />
              <Indicator label="Ranking pressure" value={scenario.rankingPressure} />
            </div>

            <div className="scarcity-model">
              <div className="supply-model">
                <div className="model-heading">
                  <Factory size={20} />
                  <h3>Track supply</h3>
                </div>
                <p>{scenario.summary}</p>
                <div className="supply-grid" aria-label={`${scenario.trackSupply} track supply`}>
                  {supplyTokens.map((token) => (
                    <span className={token < scenario.supplyCells ? 'active' : ''} key={token} />
                  ))}
                </div>
              </div>

              <div className="attention-model">
                <div className="model-heading">
                  <MousePointer2 size={20} />
                  <h3>Listener attention</h3>
                </div>
                <p>The attention pool stays fixed while more tracks compete for it.</p>
                <div className="attention-pool" aria-label="Fixed listener attention pool">
                  {attentionTokens.map((token) => (
                    <span key={token} />
                  ))}
                </div>
              </div>
            </div>

            <div className="effect-list">
              {scenario.effects.map((effect) => (
                <div key={effect}>
                  <ArrowRight size={17} />
                  <p>{effect}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ranking-section" aria-labelledby="ranking-title">
          <div className="section-heading">
            <p className="kicker">Recommendation bottleneck</p>
            <h2 id="ranking-title">The platform does not need to own every track to control the path.</h2>
          </div>
          <div className="ranking-grid">
            <ExplanationCard icon={Shuffle} title="Search and playlists narrow the catalog">
              Listeners rarely browse every available song. They meet the catalog through ranked
              surfaces such as search, autoplay, playlists, and short-form feeds.
            </ExplanationCard>
            <ExplanationCard icon={Eye} title="Signals become leverage">
              Skips, saves, completions, replays, and playlist behavior tell the platform what to
              test next. More supply gives the system more cheap experiments.
            </ExplanationCard>
            <ExplanationCard icon={SlidersHorizontal} title="Mood-fit can beat authorship">
              Background, study, sleep, and workout contexts reward tracks that fit a use case.
              In those lanes, the source of a track can matter less than how reliably it keeps
              listening going.
            </ExplanationCard>
          </div>
        </section>

        <section className="value-grid" id="value" aria-labelledby="value-title">
          <div className="control-panel">
            <p className="kicker">Value comparison</p>
            <h2 id="value-title">More music can still narrow who captures value.</h2>
            <p>
              The bars are illustrative directions, not industry totals. They show how leverage
              changes when supply grows and ranking becomes the bottleneck.
            </p>
            <div className="segmented" role="group" aria-label="Choose value model">
              {valueStates.map((state) => (
                <button
                  className={state.key === valueStateKey ? 'active' : ''}
                  type="button"
                  key={state.key}
                  onClick={() => setValueStateKey(state.key)}
                >
                  {state.label}
                </button>
              ))}
            </div>
          </div>

          <div className="value-panel">
            <div className="value-summary">
              <CircleDollarSign size={24} />
              <div>
                <h3>{valueState.label}</h3>
                <p>{valueState.summary}</p>
              </div>
            </div>
            <div className="value-bars">
              {valueState.groups.map((group) => (
                <div className="value-bar" key={group.label}>
                  <div className="bar-label">
                    <strong>{group.label}</strong>
                    <span>{group.level}</span>
                  </div>
                  <div className="bar-track" aria-hidden="true">
                    <span style={{ width: `${group.width}%` }} />
                  </div>
                  <p>{group.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="takeaway-grid" id="takeaway" aria-labelledby="takeaway-title">
          <div>
            <p className="kicker">Takeaway</p>
            <h2 id="takeaway-title">The scarce thing is not music. It is attention.</h2>
          </div>
          <div className="takeaway-copy">
            <p>
              AI-generated music matters because it can make supply easier to produce at scale.
              Once supply expands, recommendation systems decide which tracks become visible,
              which tracks stay buried, and which actors capture the most value from listening.
            </p>
            <p>
              The core question is not whether AI music is real music. The core question is who
              gains power when production becomes abundant and visibility becomes the bottleneck.
            </p>
          </div>
        </section>

        <footer className="sources-footer" aria-labelledby="works-title">
          <div>
            <p className="kicker">Footer sources</p>
            <h2 id="works-title">Works Sampled</h2>
          </div>
          <ol>
            {worksSampled.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ol>
        </footer>
      </main>
    </div>
  )
}

function Indicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="indicator">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ExplanationCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Factory
  title: string
  children: ReactNode
}) {
  return (
    <article className="explanation-card">
      <Icon size={21} />
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

export default App
