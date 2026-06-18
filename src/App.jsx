import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import RecurrenceList from './pages/RecurrenceList.jsx'
import RecurrenceForm from './pages/RecurrenceForm.jsx'
import ProfileList from './pages/ProfileList.jsx'
import ProfileForm from './pages/ProfileForm.jsx'
import OccurrenceList from './pages/OccurrenceList.jsx'
import OccurrenceDetail from './pages/OccurrenceDetail.jsx'
import TranscriptionList from './pages/TranscriptionList.jsx'
import TranscriptionDetail from './pages/TranscriptionDetail.jsx'
import SummarizationList from './pages/SummarizationList.jsx'
import SummarizationDetail from './pages/SummarizationDetail.jsx'
import CostsStub from './pages/CostsStub.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/recurrences', label: 'Recorrências' },
  { to: '/profiles', label: 'Perfis de sumarização' },
  { to: '/occurrences', label: 'Ocorrências' },
  { to: '/transcriptions', label: 'Transcrições' },
  { to: '/summarizations', label: 'Sumarizações' },
  { to: '/costs', label: 'Custos' },
]

export default function App() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h1 className="brand">Kumbuk.ai</h1>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className="navlink">
            {n.label}
          </NavLink>
        ))}
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recurrences" element={<RecurrenceList />} />
          <Route path="/recurrences/new" element={<RecurrenceForm />} />
          <Route path="/recurrences/:id" element={<RecurrenceForm />} />
          <Route path="/profiles" element={<ProfileList />} />
          <Route path="/profiles/new" element={<ProfileForm />} />
          <Route path="/profiles/:id" element={<ProfileForm />} />
          <Route path="/occurrences" element={<OccurrenceList />} />
          <Route path="/occurrences/:id" element={<OccurrenceDetail />} />
          <Route path="/transcriptions" element={<TranscriptionList />} />
          <Route path="/transcriptions/:id" element={<TranscriptionDetail />} />
          <Route path="/summarizations" element={<SummarizationList />} />
          <Route path="/summarizations/:id" element={<SummarizationDetail />} />
          <Route path="/costs" element={<CostsStub />} />
        </Routes>
      </main>
    </div>
  )
}
