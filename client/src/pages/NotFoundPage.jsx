import Navbar from '../components/layout/Navbar'; import Footer from '../components/layout/Footer';
export default function NotFoundPage(){return <><Navbar/><main className="not-found"><span className="eyebrow">Oops</span><h1>404</h1><p>That page took a wrong turn on campus.</p><a className="btn btn-primary" href="/">Back to home</a></main><Footer/></>}
