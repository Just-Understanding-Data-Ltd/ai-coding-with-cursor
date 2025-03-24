"use client";

import { motion } from "framer-motion";
import { ContentStrategyData, VideoData } from "../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, Download } from "lucide-react";

interface VideosTabProps {
  data: ContentStrategyData;
  formatNumber: (num: number) => string;
  formatDuration: (seconds: number) => string;
}

export function VideosTab({
  data,
  formatNumber,
  formatDuration,
}: VideosTabProps) {
  // Calculate engagement for each video
  const calculateEngagement = (video: VideoData): number => {
    // Calculate engagement rate as a percentage of interactions
    return parseFloat(
      ((video.likes + video.comments + video.shares) / 1000).toFixed(1)
    );
  };

  // Sort videos by engagement rate (highest first)
  const sortedVideos = [...data.topVideos].sort(
    (a, b) => calculateEngagement(b) - calculateEngagement(a)
  );

  // Function to download a fake CSV file with video data
  const downloadVideosCSV = () => {
    // Create a simple CSV content
    const headers =
      "Platform,Likes,Comments,Shares,Views,Engagement Rate,Comments/Likes,Shares/Likes\n";
    const rows = data.topVideos
      .map((video) => {
        const commentsToLikes = calculateRatio(video.comments, video.likes);
        const sharesToLikes = calculateRatio(video.shares, video.likes);
        const engagementRate = calculateEngagement(video);
        return `${video.platform},${video.likes},${video.comments},${video.shares},${video.views},${engagementRate.toFixed(1)},${commentsToLikes},${sharesToLikes}`;
      })
      .join("\n");

    const csvContent = headers + rows;

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "content_videos_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate engagement ratios
  const calculateRatio = (numerator: number, denominator: number): string => {
    if (denominator === 0) return "0.00%";
    return ((numerator / denominator) * 100).toFixed(2) + "%";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Engagement metrics for analyzed content
          </CardDescription>
        </div>
        <Button variant="outline" onClick={downloadVideosCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Content</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Engagement Rate</TableHead>
                <TableHead className="text-right">Comments/Likes</TableHead>
                <TableHead className="text-right">Shares/Likes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVideos.slice(0, 10).map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-14 w-14 rounded-md overflow-hidden">
                        <img
                          src={
                            video.thumbnailUrl ||
                            `https://via.placeholder.com/150/8264d8/FFFFFF?text=${video.platform.charAt(0)}`
                          }
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm line-clamp-2">
                          {video.title}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {video.platform}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(video.likes)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(video.comments)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(video.shares)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        calculateEngagement(video) > 5 ? "default" : "secondary"
                      }
                    >
                      {calculateEngagement(video).toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        video.comments / video.likes > 0.1
                          ? "bg-green-100 border-green-200"
                          : ""
                      }
                    >
                      {calculateRatio(video.comments, video.likes)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        video.shares / video.likes > 0.05
                          ? "bg-green-100 border-green-200"
                          : ""
                      }
                    >
                      {calculateRatio(video.shares, video.likes)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing 10 of {data.topVideos.length} videos
        </div>
      </CardFooter>
    </Card>
  );
}
