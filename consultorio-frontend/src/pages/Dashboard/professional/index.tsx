import { useEffect, useState } from "react";
import { MdInsertChart, MdGroup, MdTrendingUp } from "react-icons/md";
import { useAuthStore } from "../../../store/authStore";
import {
  getAppointmentStats,
  getUpcomingAppointments,
  professionalGetMyAppointments,
} from "../../../api/appointments";
import { getProfessionalRating } from "../../../api/reviews";
import { getMyServices } from "../../../api/services";

import type { Appointment } from "../../../types/appointments";
import type { RatingSummary } from "../../../api/reviews";
import type { Service } from "../../../api/services"
import "../../../styles/professional/index.css";

// grafica
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ProfessionalDashboard = () => {
  const { user } = useAuthStore();




  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalClients: 0,
    avgRating: 0,
    services: [] as Service[],
    averageDuration: 0,
    topClients: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const appointments: Appointment[] =
          await professionalGetMyAppointments();
        const totalAppointments = appointments.length;

        const completedAppointments = appointments.filter(
          (a) => a.status === "COMPLETED"
        );

        const clientMap = new Map<string, number>();
        completedAppointments.forEach((a) => {
          const clientName = a.client?.name || a.guestClient?.name;
          if (clientName) {
            clientMap.set(clientName, (clientMap.get(clientName) || 0) + 1);
          }
        });

        const totalClients = clientMap.size;

        const topClients = Array.from(clientMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        let avgRating = 0;
        if (user?.id) {
          const ratingSummary: RatingSummary = await getProfessionalRating(
            user.id
          );
          avgRating = ratingSummary.averageRating || 0;
        }

        const services: Service[] = await getMyServices();
        const averageDuration =
          services.length > 0
            ? Math.round(
                services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) /
                  services.length
              )
            : 0;

        setStats({
          totalAppointments,
          totalClients,
          avgRating,
          services,
          averageDuration,
          topClients,
        });
      } catch (error) {
        console.error("Error cargando estadísticas del profesional:", error);
      }
    };

    fetchStats();
  }, [user?.id]);

  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const data = await getUpcomingAppointments();
        setUpcomingAppointments(data);
      } catch (error) {
        console.error("Error al obtener próximas citas:", error);
      }
    };

    fetchUpcomingAppointments();
  }, []);

  const [chartStats, setChartStats] = useState<{ date: string; count: number }[]>([]);
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await getAppointmentStats();
        setChartStats(data);
      } catch (error) {
        console.error("Error al obtener gráfico de citas", error);
      }
    };
    fetchChartData();
  }, []);

  // Get next appointment for floating meeting
  const nextAppointment = upcomingAppointments[0];

  return (
    <div className={`professional-dashboard-container `}>
      {/* Header */}
      <div className="professional-header">
        <h1 className="professional-title">
          Panel del Profesional
        </h1>

      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="stat-cardP">
          <MdInsertChart className="stat-iconP text-indigo-600 dark:text-indigo-400" />
          <p className="stat-titleP">Citas Totales</p>
          <p className="stat-valueP">
            {stats.totalAppointments}
          </p>
        </div>
        <div className="stat-cardP">
          <MdGroup className="stat-iconP text-green-600 dark:text-green-400" />
          <p className="stat-titleP">Clientes Atendidos</p>
          <p className="stat-valueP">
            {stats.totalClients}
          </p>
        </div>
        <div className="stat-cardP">
          <MdTrendingUp className="stat-iconP text-yellow-600 dark:text-yellow-400" />
          <p className="stat-titleP">Promedio de Calificación</p>
          <p className="stat-valueP">
            {stats.avgRating.toFixed(1)} ⭐
          </p>
        </div>
      </div>
      
      {/* Cards tipo widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Servicios Activos */}
        <div className="card-hoverP">
          <h3 className="card-titleP">
            Servicios Activos
          </h3>
          <p className="service-countP">
            {stats.services.length === 0
              ? "Cargando..."
              : `${stats.services.length} servicio(s)`}
          </p>
          <div className="service-circleP">
            <div className="service-inner-circleP"></div>
          </div>
          <p className="duration-textP">
            Prom. duración: {stats.averageDuration} min
          </p>
        </div>

        {/* Gestión de citas */}
        <div className="card-hoverP">
          <h3 className="card-titleP">
            Gestión de Citas
          </h3>
          <a
            href="/dashboard/professional/appointments"
            className="new-appointment-btnP"
          >
            Nueva Cita
          </a>
        </div>
        
        {/* Notas recientes (como reviews) */}
        <div className="card-hoverP">
          <h3 className="card-titleP">
            Últimas Reseñas
          </h3>
          <p className="text-3xl text-center text-yellow-400 font-bold">
            {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ⭐` : 'Sin reseñas'}
          </p>
        </div>

        {/* Clientes frecuentes */}
        <div className="card-hoverP">
          <h3 className="card-titleP">
            Clientes Frecuentes
          </h3>
          {stats.topClients.length === 0 ? (
            <p className="top-clientP">Aún sin datos</p>
          ) : (
            stats.topClients.map((c) => (
              <p key={c.name} className="top-clientP">
                {c.name} - {c.count} citas
              </p>
            ))
          )}
        </div>
      </div>
      
      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-hoverP">
          <h2 className="chart-titleP">
            Gráfico de Citas (7 días)
          </h2>
          <div className="chart-containerP">
            {chartStats.length > 0 ? (
              <Line
                data={{
                  labels: chartStats.map((s) => s.date.slice(5)),
                  datasets: [
                    {
                      label: "Citas",
                      data: chartStats.map((s) => s.count),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                      },
                      ticks: {
                      }
                    },
                    y: {
                      grid: {
                      },
                      ticks: {
                      }
                    }
                  }
                }}
              />
            ) : (
              <p className="upcoming-appointmentP">Cargando datos...</p>
            )}
          </div>
        </div>

        <div className="card-hoverP">
          <h2 className="chart-titleP">
            Próximas Citas
          </h2>
          {upcomingAppointments.length === 0 ? (
            <p className="upcoming-appointmentP">No hay citas próximas</p>
          ) : (
            upcomingAppointments.map((app) => (
              <div key={app.id} className="upcoming-appointmentP mb-2">
                🕒 {app.startTime} - {app.client?.name ?? app.guestClient?.name}{" "}
                - {app.service.name}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Floating meeting */}
      {nextAppointment && (
        <div className="floating-meetingP">
          📅 Siguiente cita: {nextAppointment.startTime} con {nextAppointment.client?.name ?? nextAppointment.guestClient?.name}
        </div>
      )}
    </div>
  );
};

export default ProfessionalDashboard;