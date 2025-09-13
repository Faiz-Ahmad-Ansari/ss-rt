// utils/computeOverall.js

export function computeOverallBatting(datasets) {
    const merged = {};
    const trackers = {}; // track sums & counts per player
  
    datasets.flat().forEach((player) => {
      const normalized = {
        ...player,
        total_runs: Number(player.total_runs) || 0,
        innings: Number(player.innings) || 0,
        not_outs: Number(player.not_outs) || 0,
        fours: Number(player.fours) || 0,
        sixes: Number(player.sixes) || 0,
        highest_score: Number(player.highest_score) || 0,
        average: Number(player.average) || 0,
        strike_rate: Number(player.strike_rate) || 0,
      };
  
      if (!merged[player.player_id]) {
        merged[player.player_id] = { ...normalized };
  
        trackers[player.player_id] = {
          avgSum: normalized.average,
          srSum: normalized.strike_rate,
          count: 1,
        };
      } else {
        const existing = merged[player.player_id];
        const tracker = trackers[player.player_id];
  
        existing.total_runs += normalized.total_runs;
        existing.innings += normalized.innings;
        existing.not_outs += normalized.not_outs;
        existing.fours += normalized.fours;
        existing.sixes += normalized.sixes;
        existing.highest_score = Math.max(existing.highest_score, normalized.highest_score);
  
        tracker.avgSum += normalized.average;
        tracker.srSum += normalized.strike_rate;
        tracker.count += 1;
      }
    });
  
    // finalize per-player average & strike rate
    Object.keys(merged).forEach((id) => {
      const { avgSum, srSum, count } = trackers[id];
      merged[id].average = (avgSum / count).toFixed(2);
      merged[id].strike_rate = (srSum / count).toFixed(2);
    });
  
    return Object.values(merged).sort((a, b) => b.total_runs - a.total_runs);
  }

// ---------- Bowling ----------
export function computeOverallBowling(datasets) {
    const merged = {};
    const trackers = {}; // track sums & counts per player for avg metrics
  
    datasets.flat().forEach((player) => {
      const normalized = {
        ...player,
        total_wickets: Number(player.total_wickets) || 0,
        innings: Number(player.innings) || 0,
        balls: Number(player.balls) || 0,
        overs: parseFloat(player.overs) || 0,
        economy: Number(player.economy) || 0,
        strike_rate: Number(player.SR) || 0, // note: SR field
        average: Number(player.avg) || 0,
        maidens: Number(player.maidens) || 0,
        runs: Number(player.runs) || 0,
        dot_balls: Number(player.dot_balls) || 0,
        total_match: Number(player.total_match) || 0,
      };
  
      if (!merged[player.player_id]) {
        merged[player.player_id] = { ...normalized };
  
        trackers[player.player_id] = {
          ecoSum: normalized.economy,
          srSum: normalized.strike_rate,
          avgSum: normalized.average,
          count: 1,
        };
      } else {
        const existing = merged[player.player_id];
        const tracker = trackers[player.player_id];
  
        // aggregate cumulative stats
        existing.total_wickets += normalized.total_wickets;
        existing.innings += normalized.innings;
        existing.balls += normalized.balls;
        existing.overs += normalized.overs;
        existing.maidens += normalized.maidens;
        existing.runs += normalized.runs;
        existing.dot_balls += normalized.dot_balls;
        existing.total_match += normalized.total_match;
  
        // averages tracking
        tracker.ecoSum += normalized.economy;
        tracker.srSum += normalized.strike_rate;
        tracker.avgSum += normalized.average;
        tracker.count += 1;
      }
    });
  
    // finalize per-player economy, strike rate, average
    Object.keys(merged).forEach((id) => {
      const { ecoSum, srSum, avgSum, count } = trackers[id];
      merged[id].economy = (ecoSum / count).toFixed(2);
      merged[id].strike_rate = (srSum / count).toFixed(2);
      merged[id].average = (avgSum / count).toFixed(2);
    });
  
    // sort by wickets (desc), then economy (asc)
    return Object.values(merged).sort((a, b) => {
      if (b.total_wickets !== a.total_wickets) {
        return b.total_wickets - a.total_wickets;
      }
      return a.economy - b.economy;
    });
  }
  
  
  // ---------- Fielding ----------
  export function computeOverallFielding(datasets) {
    const playerStats = {};
  
    datasets.forEach((season) => {
      season.forEach((p) => {
        if (!playerStats[p.player_id]) {
          playerStats[p.player_id] = {
            player_id: p.player_id,
            name: p.name,
            short_name: p.short_name || "",
            profile_photo: p.profile_photo,
            team_id: p.team_id,
            team_name: p.team_name,
            is_player_pro: p.is_player_pro,
  
            // aggregated stats
            seasons: 0,
            total_match: 0,
            total_catches: 0,
            total_run_outs: 0,
            total_assist_run_outs: 0,
            total_stumpings: 0,
            total_caught_behind: 0,
            total_caught_and_bowl: 0,
            total_dismissal: 0,
          };
        }
  
        const stats = playerStats[p.player_id];
        stats.seasons += 1;
        stats.total_match += p.total_match || 0;
        stats.total_catches += p.catches || 0;
        stats.total_run_outs += p.run_outs || 0;
        stats.total_assist_run_outs += p.assist_run_outs || 0;
        stats.total_stumpings += p.stumpings || 0;
        stats.total_caught_behind += p.caught_behind || 0;
        stats.total_caught_and_bowl += p.caught_and_bowl || 0;
        stats.total_dismissal += p.total_dismissal || 0;
      });
    });
  
    // Convert to array and compute averages if player played in multiple seasons
    let result = Object.values(playerStats).map((p) => {
      return {
        ...p,
        avg_dismissal: p.total_dismissal / p.seasons,
        avg_catches: p.total_catches / p.seasons,
        avg_run_outs: p.total_run_outs / p.seasons,
        avg_stumpings: p.total_stumpings / p.seasons,
      };
    });
  
    // Sort: by total dismissal (or avg_dismissal, depending on requirement)
    result.sort((a, b) => b.total_dismissal - a.total_dismissal);
  
    // Assign ranks
    result = result.map((p, i) => ({
      ...p,
      rank: i + 1,
    }));
  
    return result;
  }
  
  // ---------- MVP ----------

export function computeOverallMvp(datasets) {
    const playerStats = {};
  
    datasets.forEach((season) => {
      season.forEach((p) => {
        if (!playerStats[p.player_id]) {
          playerStats[p.player_id] = {
            player_id: p.player_id,
            name: p.name,
            profile_photo: p.profile_photo,
            team_id: p.team_id,
            team_name: p.team_name,
            is_player_pro: p.is_player_pro,
  
            // aggregated
            seasons: 0,
            total_matches: 0,
            batting_score: 0,
            bowling_score: 0,
            fielding_score: 0,
            total_score: 0,
          };
        }
  
        const stats = playerStats[p.player_id];
        stats.seasons += 1;
        stats.total_matches += p.matches || 0;
        stats.batting_score += parseFloat(p.batting) || 0;
        stats.bowling_score += parseFloat(p.bowling) || 0;
        stats.fielding_score += parseFloat(p.fielding) || 0;
        stats.total_score += parseFloat(p.total) || 0;
      });
    });
  
    // convert to array & compute averages
    let result = Object.values(playerStats).map((p) => {
      return {
        ...p,
        batting: p.batting_score / p.seasons,
        bowling: p.bowling_score / p.seasons,
        fielding: p.fielding_score / p.seasons,
        total: p.total_score / p.seasons,
      };
    });
  
    // sort by avg_total (descending)
    result.sort((a, b) => b.total - a.total);
  
    // assign ranks
    result = result.map((p, i) => ({
      ...p,
      rank: i + 1,
    }));
  
    return result;
  }
  