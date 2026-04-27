import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Ear,
  Eye,
  Factory,
  Headphones,
  Info,
  Library,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Route,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Split,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type StationKey = 'supply' | 'gate' | 'split' | 'exit'

type Station = {
  key: StationKey
  kicker: string
  title: string
  short: string
  icon: typeof Factory
}

type Metrics = {
  gatePressure: number
  catalogGrowth: number
  productionCost: number
  attentionPerTrack: number
  platformCapture: number
  artistShare: number
  rightsShare: number
  visibility: number
}

const stations: Station[] = [
  {
    key: 'supply',
    kicker: 'Room 01',
    title: 'Supply Flood',
    short: 'AI makes tracks cheaper to produce, so the catalog expands faster than attention.',
    icon: Factory,
  },
  {
    key: 'gate',
    kicker: 'Room 02',
    title: 'Algorithm Gate',
    short: 'The platform decides which tracks become visible and which stay buried.',
    icon: Route,
  },
  {
    key: 'split',
    kicker: 'Room 03',
    title: 'Value Split',
    short: 'More engagement does not automatically mean more value reaches artists.',
    icon: Split,
  },
  {
    key: 'exit',
    kicker: 'Exit Wall',
    title: 'What Changed?',
    short: 'The remix turns a structural academic argument into a visitor-controlled exhibit.',
    icon: Library,
  },
]

const moods = [
  {
    id: 'study',
    label: 'Study Focus',
    copy: 'Low-risk background tracks are rewarded because the listener may not notice repetition.',
    boost: 12,
  },
  {
    id: 'workout',
    label: 'Workout Rush',
    copy: 'Fast tempo patterns cluster together, so similar tracks compete inside a narrow lane.',
    boost: 8,
  },
  {
    id: 'discovery',
    label: 'New Finds',
    copy: 'Discovery sounds open, but ranking still filters what can be discovered first.',
    boost: -6,
  },
]

const worksSampled = [
  'McNamee, Noah. "Artificial Intelligence and the Redistribution of Value in the Digital Music Economy." Unpublished scholarly article, Writing 101, 2026.',
  'McNamee, Noah. Dossier for the Multimodal Remix. Writing 101, 23 Apr. 2026.',
  'Christian, Bryce M. Interactive Pathways: Designing Accessible Museum Experiences. University of South Carolina, 2025.',
  'Huang, Jiaying, and Wenhua Li. "Research on Innovative Strategies of Museum Display Design to Improve User Experience." Human-Computer Interaction. HCII 2024, Springer, 2024, pp. 343-358.',
  'Meng, Lei, et al. "Research on a User-Centered Evaluation Model for Audience Experience and Display Narrative of Digital Museums." Electronics, vol. 11, no. 9, 2022, article 1445.',
  'Wang, Zezhong, et al. "Comparing Effectiveness and Engagement of Data Comics and Infographics." Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems, ACM, 2019, pp. 1-12.',
]

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

function useGalleryAudio(enabled: boolean, aiLevel: number, station: StationKey) {
  const contextRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{
    oscillators: OscillatorNode[]
    gain: GainNode
    filter: BiquadFilterNode
  } | null>(null)

  useEffect(() => {
    if (!enabled) {
      nodesRef.current?.gain.gain.setTargetAtTime(0, contextRef.current?.currentTime ?? 0, 0.05)
      return
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const context = contextRef.current ?? new AudioContextClass()
    contextRef.current = context

    if (!nodesRef.current) {
      const gain = context.createGain()
      const filter = context.createBiquadFilter()
      const oscillators = [context.createOscillator(), context.createOscillator()]

      filter.type = 'lowpass'
      filter.frequency.value = 680
      gain.gain.value = 0

      oscillators[0].type = 'sine'
      oscillators[1].type = 'triangle'
      oscillators[0].connect(filter)
      oscillators[1].connect(filter)
      filter.connect(gain)
      gain.connect(context.destination)
      oscillators.forEach((oscillator) => oscillator.start())
      nodesRef.current = { oscillators, gain, filter }
    }

    void context.resume()
    const now = context.currentTime
    const base = station === 'gate' ? 196 : station === 'split' ? 164 : station === 'exit' ? 132 : 148
    const drift = aiLevel * 1.4

    nodesRef.current.oscillators[0].frequency.setTargetAtTime(base + drift, now, 0.08)
    nodesRef.current.oscillators[1].frequency.setTargetAtTime(base * 1.5 + drift * 0.35, now, 0.08)
    nodesRef.current.filter.frequency.setTargetAtTime(360 + aiLevel * 9, now, 0.12)
    nodesRef.current.gain.gain.setTargetAtTime(0.045, now, 0.08)

    return () => {
      nodesRef.current?.gain.gain.setTargetAtTime(0, context.currentTime, 0.08)
    }
  }, [enabled, aiLevel, station])
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

function App() {
  const [stationIndex, setStationIndex] = useState(0)
  const [aiLevel, setAiLevel] = useState(62)
  const [selectedMood, setSelectedMood] = useState(moods[0])
  const [compareMode, setCompareMode] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const [visited, setVisited] = useState<Set<StationKey>>(new Set(['supply']))

  const station = stations[stationIndex]

  useGalleryAudio(audioOn, aiLevel, station.key)

  const metrics = useMemo(() => {
    const gatePressure = clamp(aiLevel + selectedMood.boost)
    const catalogGrowth = Math.round(120 + aiLevel * 8.6)
    const productionCost = Math.round(100 - aiLevel * 0.74)
    const attentionPerTrack = Math.max(6, Math.round(74 - aiLevel * 0.58))
    const platformCapture = Math.round(34 + gatePressure * 0.38)
    const artistShare = Math.max(8, Math.round(46 - gatePressure * 0.23))
    const rightsShare = Math.max(18, 100 - platformCapture - artistShare)
    const visibility = Math.max(10, Math.round(80 - gatePressure * 0.52))

    return {
      gatePressure,
      catalogGrowth,
      productionCost,
      attentionPerTrack,
      platformCapture,
      artistShare,
      rightsShare,
      visibility,
    }
  }, [aiLevel, selectedMood.boost])

  const progress = (visited.size / stations.length) * 100

  const visitStation = (index: number) => {
    const nextIndex = Math.min(stations.length - 1, Math.max(0, index))
    setStationIndex(nextIndex)
    setVisited((current) => new Set(current).add(stations[nextIndex].key))
  }

  const goNext = () => visitStation(stationIndex + 1)
  const resetExhibit = () => {
    setStationIndex(0)
    setAiLevel(62)
    setSelectedMood(moods[0])
    setCompareMode(false)
    setVisited(new Set<StationKey>(['supply']))
  }

  return (
    <div className="app-shell">
      <header className="museum-header" aria-label="Exhibit navigation">
        <a className="brand-lockup" href="#top" aria-label="The Platform Machine lobby">
          <span className="brand-mark" aria-hidden="true">
            PM
          </span>
          <span>
            <strong>The Platform Machine</strong>
            <span className="brand-subtitle">Interactive museum exhibit</span>
          </span>
        </a>
        <nav className="station-nav" aria-label="Station list">
          {stations.map((item, index) => (
            <button
              className={index === stationIndex ? 'active' : ''}
              type="button"
              key={item.key}
              onClick={() => visitStation(index)}
            >
              <span>{item.kicker}</span>
              {item.title}
            </button>
          ))}
        </nav>
        <button
          className="icon-button"
          type="button"
          onClick={() => setAudioOn((value) => !value)}
          aria-label={audioOn ? 'Turn gallery audio off' : 'Turn gallery audio on'}
        >
          {audioOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      <main id="top">
        <section className="lobby-grid" aria-labelledby="page-title">
          <div className="intro-panel">
            <p className="audience-line">For non-scholarly museum visitors and music streamers</p>
            <h1 id="page-title">
              <span>When AI makes</span>
              <span>music cheap,</span>
              <span>who gets more power?</span>
            </h1>
            <p className="intro-copy">
              Move through four exhibit stations to remix a scholarly argument about AI,
              streaming, and platform economics. The claim is not that AI music is fake music;
              it is that cheaper production can intensify the systems that already control
              attention and payment.
            </p>
            <div className="mode-strip" aria-label="Modes used in this remix">
              <span>
                <Info size={15} /> Textual
              </span>
              <span>
                <Eye size={15} /> Visual
              </span>
              <span>
                <Route size={15} /> Spatial
              </span>
              <span>
                <MousePointer2 size={15} /> Gestural
              </span>
              <span>
                <Ear size={15} /> Aural
              </span>
            </div>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={goNext}>
                Enter next room <ArrowRight size={18} />
              </button>
              <button className="secondary-action" type="button" onClick={resetExhibit}>
                <RotateCcw size={17} /> Reset exhibit
              </button>
            </div>
          </div>

          <div className="machine-panel" aria-label="Interactive exhibit machine">
            <div className="machine-topline">
              <span>Interactive wall graphic</span>
              <strong>{station.kicker}: {station.title}</strong>
            </div>
            <div className="machine-map">
              {stations.slice(0, 3).map((item, index) => {
                const Icon = item.icon
                const isActive = index === stationIndex
                return (
                  <button
                    className={`machine-node ${isActive ? 'active' : ''} ${
                      visited.has(item.key) ? 'visited' : ''
                    }`}
                    type="button"
                    key={item.key}
                    onClick={() => visitStation(index)}
                  >
                    <b>{index + 1}</b>
                    <Icon size={22} />
                    <span>{item.title}</span>
                  </button>
                )
              })}
              <div className="machine-line line-a" aria-hidden="true" />
              <div className="machine-line line-b" aria-hidden="true" />
              <div className="flow-arrow arrow-a" aria-hidden="true" />
              <div className="flow-arrow arrow-b" aria-hidden="true" />
              <div className="pulse-core" aria-label="Platform engine visualization">
                <Sparkles size={28} />
                <span>{metrics.gatePressure}%</span>
                <small>gate pressure</small>
              </div>
              <div className="map-callout callout-supply">
                <strong>Production cost drops</strong>
                <span>Cheaper tracks expand supply before attention expands.</span>
              </div>
              <div className="map-callout callout-gate">
                <strong>Recommendation becomes the bottleneck</strong>
                <span>Visibility moves through the platform gate first.</span>
              </div>
              <div className="map-callout callout-split">
                <strong>Value collects upstream</strong>
                <span>More listening does not guarantee more artist leverage.</span>
              </div>
            </div>
            <div className="quick-read">
              <div>
                <span>Catalog growth</span>
                <strong>{metrics.catalogGrowth}%</strong>
              </div>
              <div>
                <span>Avg. production cost</span>
                <strong>{metrics.productionCost}%</strong>
              </div>
              <div>
                <span>Visible long tail</span>
                <strong>{metrics.visibility}%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="floor-plan" aria-label="Exhibit progress">
          <div className="floor-label">
            <MapPinIcon />
            <span>{Math.round(progress)}% of exhibit visited</span>
          </div>
          <div className="rail" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="rail-rooms">
            {stations.map((item, index) => (
              <button
                type="button"
                className={index === stationIndex ? 'active' : ''}
                onClick={() => visitStation(index)}
                key={item.key}
              >
                {item.kicker}
              </button>
            ))}
          </div>
        </section>

        <section className="exhibit-stage" aria-live="polite">
          <aside className="docent-card">
            <span>{station.kicker}</span>
            <h2>{station.title}</h2>
            <p>{station.short}</p>
            <button
              type="button"
              className="small-audio"
              onClick={() => setAudioOn((value) => !value)}
            >
              {audioOn ? <Pause size={16} /> : <Play size={16} />}
              {audioOn ? 'Pause ambient layer' : 'Play ambient layer'}
            </button>
          </aside>

          <div className="station-surface">
            {station.key === 'supply' && (
              <SupplyRoom aiLevel={aiLevel} setAiLevel={setAiLevel} metrics={metrics} />
            )}
            {station.key === 'gate' && (
              <GateRoom
                aiLevel={aiLevel}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                metrics={metrics}
              />
            )}
            {station.key === 'split' && (
              <SplitRoom
                compareMode={compareMode}
                setCompareMode={setCompareMode}
                metrics={metrics}
                aiLevel={aiLevel}
              />
            )}
            {station.key === 'exit' && <ExitRoom />}
          </div>
        </section>

        <section className="bottom-gallery" aria-labelledby="works-title">
          <div>
            <p className="audience-line">Rhetorical aim</p>
            <h2>Make the structure feel touchable</h2>
            <p>
              The exhibit uses logos through simulated flows, pathos through a visitor-centered
              sense of crowding and narrowing, and ethos through visible source plaques. Its
              remix criteria are transformation of audience, form, sequence, and mode.
            </p>
          </div>
          <div className="source-plaque">
            <h2 id="works-title">Works Sampled</h2>
            <ol>
              {worksSampled.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}

function SupplyRoom({
  aiLevel,
  setAiLevel,
  metrics,
}: {
  aiLevel: number
  setAiLevel: (value: number) => void
  metrics: Metrics
}) {
  const tracks = Array.from({ length: 48 }, (_, index) => index)
  const litTracks = Math.round((aiLevel / 100) * tracks.length)

  return (
    <article className="room-grid">
      <div className="control-column">
        <p className="room-kicker">Gesture: drag the production dial</p>
        <h2>Lower cost expands the catalog faster than listeners expand attention.</h2>
        <p>
          In the scholarly version, this was explained as a structural market shift. Here the
          visitor adjusts the dial and watches the room fill with tracks while attention per
          track falls.
        </p>
        <label className="range-control">
          <span>
            AI-assisted production level
            <strong>{aiLevel}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={aiLevel}
            onChange={(event) => setAiLevel(Number(event.target.value))}
          />
        </label>
        <div className="stepper-control" role="group" aria-label="Adjust AI-assisted production level">
          <button type="button" onClick={() => setAiLevel(clamp(aiLevel - 10))}>
            Lower
          </button>
          <button type="button" onClick={() => setAiLevel(clamp(aiLevel + 10))}>
            Raise
          </button>
        </div>
      </div>
      <div className="artifact-case supply-case">
        <div className="case-header">
          <Factory size={20} />
          <span>Catalog shelf</span>
        </div>
        <div className="track-wall" aria-label={`${litTracks} highlighted tracks`}>
          {tracks.map((track) => (
            <span
              className={track < litTracks ? 'lit' : ''}
              style={{ animationDelay: `${track * 18}ms` }}
              key={track}
            />
          ))}
        </div>
        <div className="metric-row">
          <Metric label="Catalog growth" value={`${metrics.catalogGrowth}%`} />
          <Metric label="Production cost" value={`${metrics.productionCost}%`} />
          <Metric label="Attention per track" value={`${metrics.attentionPerTrack}%`} />
        </div>
      </div>
    </article>
  )
}

function GateRoom({
  aiLevel,
  selectedMood,
  setSelectedMood,
  metrics,
}: {
  aiLevel: number
  selectedMood: (typeof moods)[number]
  setSelectedMood: (mood: (typeof moods)[number]) => void
  metrics: Metrics
}) {
  const queue = [
    { label: 'Human indie release', score: 56 - aiLevel * 0.12 },
    { label: 'AI mood loop', score: 48 + aiLevel * 0.34 + selectedMood.boost },
    { label: 'Major label single', score: 70 - aiLevel * 0.04 },
    { label: 'Experimental local track', score: 38 - aiLevel * 0.18 },
  ].sort((a, b) => b.score - a.score)

  return (
    <article className="room-grid">
      <div className="control-column">
        <p className="room-kicker">Gesture: choose a listening situation</p>
        <h2>The gate is invisible, but it shapes the route through culture.</h2>
        <p>
          The visitor does not pick from every song. The platform ranks a small path first.
          AI-generated supply matters because it gives the gate more cheap material to test,
          recommend, and monetize.
        </p>
        <div className="segmented" role="group" aria-label="Choose listener situation">
          {moods.map((mood) => (
            <button
              className={selectedMood.id === mood.id ? 'active' : ''}
              type="button"
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
            >
              {mood.label}
            </button>
          ))}
        </div>
        <p className="microcopy">{selectedMood.copy}</p>
      </div>
      <div className="artifact-case gate-case">
        <div className="case-header">
          <Shuffle size={20} />
          <span>Recommendation gate</span>
        </div>
        <div className="gate-visual">
          <div className="listener-token">
            <Headphones size={24} />
            <span>visitor</span>
          </div>
          <div className="ranking-stack">
            {queue.map((item, index) => (
              <div className="rank-card" key={item.label}>
                <span>0{index + 1}</span>
                <strong>{item.label}</strong>
                <i style={{ width: `${clamp(item.score)}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="metric-row">
          <Metric label="Gate pressure" value={`${metrics.gatePressure}%`} />
          <Metric label="Visible long tail" value={`${metrics.visibility}%`} />
          <Metric label="AI level" value={`${aiLevel}%`} />
        </div>
      </div>
    </article>
  )
}

function SplitRoom({
  compareMode,
  setCompareMode,
  metrics,
  aiLevel,
}: {
  compareMode: boolean
  setCompareMode: (value: boolean) => void
  metrics: Metrics
  aiLevel: number
}) {
  const baseline = {
    platformCapture: 38,
    rightsShare: 34,
    artistShare: 28,
  }

  const active = compareMode
    ? baseline
    : {
        platformCapture: metrics.platformCapture,
        rightsShare: metrics.rightsShare,
        artistShare: metrics.artistShare,
      }

  return (
    <article className="room-grid">
      <div className="control-column">
        <p className="room-kicker">Gesture: switch the comparison</p>
        <h2>More tracks can create more engagement while narrowing who captures value.</h2>
        <p>
          The point is a redistribution problem: platforms benefit from abundant content,
          listener data, and recommendation control, even when individual creators face thinner
          visibility and payment.
        </p>
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(event) => setCompareMode(event.target.checked)}
          />
          <span>{compareMode ? 'Show baseline streaming economy' : 'Show AI-saturated economy'}</span>
        </label>
      </div>
      <div className="artifact-case split-case">
        <div className="case-header">
          <CircleDollarSign size={20} />
          <span>Value flow model</span>
        </div>
        <div className="flow-stage">
          <div className="pool">
            <span>listener attention</span>
            <strong>{compareMode ? 'baseline' : `${aiLevel}% AI supply`}</strong>
          </div>
          <div className="split-bars">
            <FlowBar
              label="Platform"
              value={active.platformCapture}
              className="platform"
              note="data, ads, subscriptions, ranking power"
            />
            <FlowBar
              label="Rights holders"
              value={active.rightsShare}
              className="rights"
              note="catalog ownership and licensing leverage"
            />
            <FlowBar
              label="Artists"
              value={active.artistShare}
              className="artists"
              note="streams divided across a crowded field"
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function ExitRoom() {
  return (
    <article className="exit-room">
      <div className="exit-copy">
        <p className="room-kicker">Exit Wall</p>
        <h2>This is a remix because the argument changes medium, pace, and audience.</h2>
        <p>
          The scholarly article explains a system through academic claims. This exhibit
          translates that system into an embodied path: visitors move room by room, make choices,
          hear an optional ambient layer, and see how a platform economy reacts.
        </p>
      </div>
      <div className="criteria-grid">
        <Criterion icon={Library} title="Audience">
          Casual museum visitors and music listeners who understand playlists, but may not know
          platform economics.
        </Criterion>
        <Criterion icon={BarChart3} title="Methods">
          Long explanation becomes interactive modeling, progressive disclosure, and source
          plaques.
        </Criterion>
        <Criterion icon={SlidersHorizontal} title="Materials">
          Academic claims become sliders, floor-plan navigation, ranking cards, flow bars, and
          generated tones.
        </Criterion>
        <Criterion icon={MousePointer2} title="Appeals">
          Logos through causal models, pathos through crowding and narrowing, ethos through
          transparent sourcing.
        </Criterion>
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FlowBar({
  label,
  value,
  className,
  note,
}: {
  label: string
  value: number
  className: string
  note: string
}) {
  return (
    <div className="flow-bar">
      <div className="flow-label">
        <strong>{label}</strong>
        <span>{value}%</span>
      </div>
      <div className="bar-track">
        <span className={className} style={{ width: `${value}%` }} />
      </div>
      <p>{note}</p>
    </div>
  )
}

function Criterion({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Library
  title: string
  children: ReactNode
}) {
  return (
    <div className="criterion">
      <Icon size={20} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  )
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="map-pin">
      <path d="M10 2.5c-3 0-5.4 2.3-5.4 5.2 0 3.7 5.4 9.8 5.4 9.8s5.4-6.1 5.4-9.8c0-2.9-2.4-5.2-5.4-5.2Zm0 7.3A2.1 2.1 0 1 1 10 5.6a2.1 2.1 0 0 1 0 4.2Z" />
    </svg>
  )
}

export default App
