"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/types/calendar';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from "@/hooks/use-toast"
import { calendarApi } from "@/services/api/calendarApi";
import { useRouter } from 'next/navigation';

/**
 * A calendar component that shows a grid of days in a month
 * and marks the days that have events with a colored dot.
 */
export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const { toast } = toast()
    const router = useRouter()

    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const eventsData = await calendarApi.getEvents()
                setEvents(eventsData);
            } catch (e: any) {
                setError(e.message || "Failed to load events.");
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: error,
                })
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, [currentDate, router]);

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = firstDayOfMonth + daysInMonth;
        const weeks = Math.ceil(totalDays / 7);

        for (let i = 0; i < weeks * 7; i++) {
            const dayNumber = i - firstDayOfMonth + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const dayEvents = isCurrentMonth ? getEventsForDay(dayNumber) : [];

            days.push(
                <div
                    key={i}
                    className={`min-h-[120px] border border-gray-200 p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        }`}
                >
                    {isCurrentMonth && (
                        <>
                            <span className="text-sm text-gray-500">{dayNumber}</span>
                            <div className="mt-1 space-y-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`text-xs p-1 rounded truncate ${event.type === 'product_launch'
                                            ? 'bg-blue-100 text-blue-800'
                                            : event.type === 'sale'
                                                ? 'bg-green-100 text-green-800'
                                                : event.type === 'promotion'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        title={`${event.title}\n${event.description}`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-700">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div>Loading events...</div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div
                                    key={day}
                                    className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                            {renderCalendarDays()}
                        </div>
                    </div>
                )}

                <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h4>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-blue-100"></div>
                            <span className="text-sm text-gray-700">Product Launch</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-green-100"></div>
                            <span className="text-sm text-gray-700">Sale</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-purple-100"></div>
                            <span className="text-sm text-gray-700">Promotion</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-gray-100"></div>
                            <span className="text-sm text-gray-700">Other</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}