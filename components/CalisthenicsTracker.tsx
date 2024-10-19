"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

type Exercise = {
  name: string;
  reps: number;
  timestamp: string;
};

type DailyStats = {
  date: string;
  [key: string]: number | string;
};

const CalisthenicsTracker: React.FC = () => {
  const [exercises, setExercises] = useState<string[]>(['Pull-ups', 'Sit-ups', 'Push-ups', 'Crunches']);
  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0]);
  const [reps, setReps] = useState<number>(0);
  const [newExercise, setNewExercise] = useState<string>('');
  const [log, setLog] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const savedLog = localStorage.getItem('exerciseLog');
    if (savedLog) {
      setLog(JSON.parse(savedLog));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('exerciseLog', JSON.stringify(log));
    updateStats();
  }, [log]);

  const handleAddExercise = () => {
    if (newExercise && !exercises.includes(newExercise)) {
      setExercises([...exercises, newExercise]);
      setNewExercise('');
      toast({
        title: "Exercise added",
        description: `${newExercise} has been added to the list of exercises.`,
      });
    }
  };

  const handleLogExercise = () => {
    if (reps > 0) {
      const newEntry: Exercise = {
        name: selectedExercise,
        reps: reps,
        timestamp: new Date().toISOString(),
      };
      setLog([...log, newEntry]);
      setReps(0);
      toast({
        title: "Exercise logged",
        description: `${reps} ${selectedExercise} added to your log.`,
      });
    }
  };

  const updateStats = () => {
    const dailyStats: { [key: string]: DailyStats } = {};
    log.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { date };
      }
      if (!dailyStats[date][entry.name]) {
        dailyStats[date][entry.name] = 0;
      }
      dailyStats[date][entry.name] = (dailyStats[date][entry.name] as number) + entry.reps;
    });
    setStats(Object.values(dailyStats));
  };

  const clearLog = () => {
    setLog([]);
    localStorage.removeItem('exerciseLog');
    toast({
      title: "Log cleared",
      description: "Your exercise log has been cleared.",
    });
  };

  const getTodaysSummary = () => {
    const today = new Date().toLocaleDateString();
    const todayStats = stats.find(stat => stat.date === today);
    if (!todayStats) return "No exercises logged today.";

    return Object.entries(todayStats)
      .filter(([key]) => key !== 'date')
      .map(([exercise, reps]) => `${exercise}: ${reps}`)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calisthenics Tracker</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <SunIcon className="h-[1.2rem] w-[1.2rem]" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{getTodaysSummary()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exercise-select">Select Exercise</Label>
              <Select onValueChange={(value) => setSelectedExercise(value)} value={selectedExercise}>
                <SelectTrigger id="exercise-select">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reps-input">Number of Repetitions</Label>
              <Input
                id="reps-input"
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <Button onClick={handleLogExercise}>Log Exercise</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              placeholder="Enter new exercise name"
            />
            <Button onClick={handleAddExercise}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {exercises.map((exercise, index) => (
                <Line
                  key={exercise}
                  type="monotone"
                  dataKey={exercise}
                  stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={clearLog}>Clear Exercise Log</Button>
    </div>
  );
};

export default CalisthenicsTracker;