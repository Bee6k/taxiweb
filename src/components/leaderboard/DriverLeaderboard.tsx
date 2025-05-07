"use client";

import { useRideContext } from '@/contexts/RideContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Driver } from '@/types';
import { DRIVER_TIERS_CONFIG, UNRANKED_TIER, getDriverTier } from '@/config/constants';
import { Star } from 'lucide-react';

export function DriverLeaderboard() {
  const { driversData } = useRideContext();

  // Sort drivers: primary by averageRating (desc), secondary by number of ratings (desc), tertiary by name (asc)
  const sortedDrivers = [...driversData].sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    if (b.ratings.length !== a.ratings.length) {
      return b.ratings.length - a.ratings.length;
    }
    return a.name.localeCompare(b.name);
  });

  const getTierDisplay = (driver: Driver) => {
    const tierInfo = driver.tier === UNRANKED_TIER.name ? UNRANKED_TIER : DRIVER_TIERS_CONFIG[driver.tier as keyof typeof DRIVER_TIERS_CONFIG] || UNRANKED_TIER;
    return (
      <span className={`font-semibold ${tierInfo.colorClass}`}>
        {tierInfo.icon && <span className="mr-1">{tierInfo.icon}</span>}
        {tierInfo.name}
      </span>
    );
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Driver Leaderboard</CardTitle>
        <CardDescription>Top performing drivers based on user ratings.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedDrivers.length === 0 ? (
          <p className="text-muted-foreground">No driver data available yet.</p>
        ) : (
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Avg. Rating</TableHead>
                  <TableHead>Total Ratings</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Vehicle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDrivers.map((driver, index) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{driver.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {driver.averageRating > 0 ? driver.averageRating.toFixed(2) : 'N/A'}
                        {driver.averageRating > 0 && <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />}
                      </div>
                    </TableCell>
                    <TableCell>{driver.ratings.length}</TableCell>
                    <TableCell>{getTierDisplay(driver)}</TableCell>
                    <TableCell>{driver.vehicleModel} ({driver.licensePlate})</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
