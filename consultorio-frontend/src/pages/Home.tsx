import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const professionals = [ /// todo esto se repmplaza por una llamada a la API que se conceta en el componetente configHome.tsx
    {
      id: 1,
      name: "Dra. María López",
      specialty: "Psicología",
      image: "/home/specialitys/psych.png",
      description:
        "Especialista en terapia cognitivo-conductual con 10 años de experiencia",
    },
    {
      id: 2,
      name: "Dr. Carlos Martínez",
      specialty: "Nutrición",
      image: "/home/specialitys/nutrition.png",
      description:
        "Nutrición clínica y deportiva, enfoque en resultados sostenibles",
    },
    {
      id: 3,
      name: "Lic. Ana Fernández",
      specialty: "Fisioterapia",
      image: "/home/specialitys/physio.png",
      description:
        "Rehabilitación física y terapia de dolor con técnicas avanzadas",
    },
  ];
 
  return (
    <div className="home-container">
      {/* Hero Section con gradiente y espaciado amplio */}
      <section className="hero-section"> {/* aqui esta la img que se va a cambiar */}
        {/* NAVBAR agregado arriba del contenido */}
        <nav className="hero-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/register")}>Registrarse</button>
            </li>
          </ul>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">Cuidado integral para tu bienestar</h1> {/* aqui tambien se puede cambiar en la bd */}
          <p className="hero-subtitle">
            Expertos en salud multidisciplinaria trabajando juntos por ti
          </p>  {/* aqui tambien se puede cambiar en la bd */}
          <button className="hero-cta" onClick={() => navigate("/login?next=/reservar")}>
            Reservar cita ahora
          </button> 
        </div>
      </section>

      {/* Sección de servicios con diseño de tarjetas asimétricas */}
      <section className="services-section">
        <div className="section-header">
          <h2>Nuestros Servicios Especializados</h2>  {/* aqui tambien se puede cambiar en la bd */}
          <p className="section-description">
            Enfoque personalizado para cada necesidad
          </p>  {/* aqui tambien se puede cambiar en la bd */}
        </div>

        <div className="services-grid">  {/* aqui tambien se puede cambiar en la bd */}
          <div className="service-card card-psychology"> {/* aqui tambien se va a cabiar la img */}
            <div className="service-content">
              <h3>Psicología</h3>
              <p>
                Terapias individuales y grupales para mejorar tu salud mental
              </p>
              <button className="service-link">Conoce más</button>
            </div>
          </div>

          <div className="service-card card-nutrition"> {/* aqui tambien se va a cabiar la img */}
            <div className="service-content">
              <h3>Nutrición</h3>
              <p>
                Planes alimenticios adaptados a tus objetivos y estilo de vida
              </p>
              <button className="service-link">Conoce más</button>
            </div>
          </div>

          <div className="service-card card-physio"> {/* aqui tambien se va a cabiar la img */}
            <div className="service-content">
              <h3>Fisioterapia</h3>
              <p>Recuperación funcional y tratamiento del dolor</p>
              <button className="service-link">Conoce más</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de profesionales con diseño de mosaico */}
      <section className="professionals-section">  {/* aqui tambien se puede cambiar en la bd */}
        <div className="section-header">
          <h2>Conoce a nuestro equipo</h2>
          <p className="section-description">
            Profesionales altamente calificados
          </p>
        </div>

        <div className="professionals-mosaic">
          {professionals.map((pro, index) => (
            <div
              key={pro.id}
              className={`professional-card card-${index + 1}`}
              onClick={() => navigate(`/profesional/${pro.id}`)}
            >
              <img
                src={pro.image} /// lo mismo esta imagen se puede cambiar
                alt={pro.name}
                className="professional-image"
              />
              <div className="professional-info">
                <h3>{pro.name}</h3>
                <p className="specialty">{pro.specialty}</p>
                <p className="description">{pro.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de testimonios con diseño de quote moderno */}
      <section className="testimonials-section">  {/* aqui tambien se puede cambiar en la bd */}
        <div className="section-header">
          <h2>Historias de transformación</h2>
          <p className="section-description">Lo que nuestros pacientes dicen</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <blockquote>
              Después de 6 meses de terapia, he recuperado el control de mi
              vida. La Dra. López es excepcional.
            </blockquote>
            <div className="author">
              <div className="author-name">Laura G.</div>
              <div className="author-detail">Paciente de Psicología</div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <blockquote>
              Perdí 15kg de manera saludable y mantengo los resultados gracias
              al plan del Dr. Martínez.
            </blockquote>
            <div className="author">
              <div className="author-name">Juan P.</div>
              <div className="author-detail">Paciente de Nutrición</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CTA final con fondo dinámico */}
      <section className="final-cta">  {/* aqui tambien se puede cambiar en la bd */}
        <div className="cta-content">
          <h2>¿Listo para comenzar tu viaje hacia el bienestar?</h2>
<button className="cta-button" onClick={() => navigate("/login?next=/dashboard/client/book")}>
  Reserva tu primera cita
</button>

        </div>
      </section>
    </div>
  );
};

export default Home;