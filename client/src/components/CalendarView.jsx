import { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ learnings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const getEventsForDay = (date) => {
    return learnings.filter(l => isSameDay(new Date(l.nextReviewDate), date));
  };

  const isDayOverdue = (date) => {
    return isBefore(date, today) && getEventsForDay(date).length > 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      {/* Calendar Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="font-bold text-gray-800 dark:text-white">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded cursor-pointer">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded cursor-pointer">
            <ChevronRight className="w-5 h-5"/>
          </button>
        </div>
      </div>

      {/* Days Row */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-sm">
        {calendarDays.map((day) => {
          const events = getEventsForDay(day);
          const isSelectedMonth = day.getMonth() === currentDate.getMonth();
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => setSelectedDate(day)}
              className={`min-h-[80px] p-2 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors ${
                !isSelectedMonth 
                  ? 'bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'
              } ${selectedDate && isSameDay(day, selectedDate) ? 'ring-2 ring-inset ring-indigo-400' : ''}`}
            >
              <div className={`text-right mb-1 ${isToday(day) ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                <span className={isToday(day) ? 'bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full' : ''}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {events.map(event => (
                  <div
                    key={event._id}
                    className={`text-[10px] px-1 py-0.5 rounded truncate ${
                      isBefore(day, today)
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200'
                    }`}
                    title={event.topic}
                  >
                    {event.topic}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-3">
            {format(selectedDate, 'MMMM do, yyyy')}
          </h3>
          {getEventsForDay(selectedDate).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nothing scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDay(selectedDate).map(event => (
                <div key={event._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stage {event.stage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;