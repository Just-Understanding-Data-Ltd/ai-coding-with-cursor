"use client";

import { motion } from "framer-motion";
import { ContentStrategyData } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsCardsProps {
  data: ContentStrategyData;
  formatNumber: (num: number) => string;
}

export function StatsCards({ data, formatNumber }: StatsCardsProps) {
  // Calculate total engagement with a more realistic formula
  const totalLikes = data.topVideos.reduce(
    (sum, video) => sum + video.likes,
    0
  );

  const totalComments = data.topVideos.reduce(
    (sum, video) => sum + video.comments,
    0
  );

  const totalShares = data.topVideos.reduce(
    (sum, video) => sum + video.shares,
    0
  );

  // Calculate engagement rate as a percentage of interactions per video
  const engagementRate =
    data.topVideos.length > 0
      ? (totalLikes + totalComments + totalShares) /
        data.topVideos.length /
        1000
      : 0;

  const totalEngagement = parseFloat(engagementRate.toFixed(2));

  // Function to download a fake CSV file
  const downloadCSV = () => {
    // Create a simple CSV content
    const csvContent = `Content Strategy Analysis,\nDate,${new Date().toLocaleDateString()}\nTotal Videos,${data.totalVideosAnalyzed}\nTotal Likes,${totalLikes}\nTotal Comments,${totalComments}\nTotal Shares,${totalShares}\nEngagement Rate,${totalEngagement.toFixed(2)}\n\nHashtags,Popularity,Relevance\n${data.selectedHashtags.map((h) => `${h.tag},${h.popularity},${h.relevance}`).join("\n")}`;

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "content_strategy_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={downloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download All Data
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Videos Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalVideosAnalyzed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From TikTok & Instagram
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEngagement.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {(totalEngagement / 20).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLikes)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatNumber(totalLikes / data.topVideos.length)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {data.selectedHashtags.slice(0, 3).map((hashtag) => (
                <Badge key={hashtag.tag} variant="outline" className="text-xs">
                  {hashtag.tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
