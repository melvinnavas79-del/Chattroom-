import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';

const EventosTab = ({ API }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-3xl font-bold text-center">🎉 Eventos</h2>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎆</div>
          <p className="text-gray-400">No hay eventos activos en este momento</p>
          <p className="text-gray-500 text-sm mt-2">¡Mantente atento para próximos eventos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-slate-800/50 border-pink-500/20 p-6">
              <div className="mb-4">
                <h3 className="text-white text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-400">{event.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tipo:</span>
                  <span className="text-purple-400 font-bold">{event.event_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Inicio:</span>
                  <span className="text-green-400">{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fin:</span>
                  <span className="text-red-400">{new Date(event.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              {event.rewards && event.rewards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-pink-500/20">
                  <p className="text-gray-400 text-sm mb-2">Recompensas:</p>
                  <div className="flex flex-wrap gap-2">
                    {event.rewards.map((reward, index) => (
                      <span
                        key={index}
                        className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs"
                      >
                        {reward.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventosTab;
