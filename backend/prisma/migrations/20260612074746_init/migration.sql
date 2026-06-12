-- CreateTable
CREATE TABLE "Summoner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "puuid" TEXT NOT NULL,
    "summonerId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'EUW1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "summonerId" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "timeElapsed" INTEGER NOT NULL,
    "gameDate" DATETIME NOT NULL,
    "queueId" INTEGER NOT NULL DEFAULT 1100,
    "augments" TEXT NOT NULL DEFAULT '[]',
    "units" TEXT NOT NULL DEFAULT '[]',
    "lpBefore" INTEGER,
    "lpAfter" INTEGER,
    "lpDelta" INTEGER,
    "tier" TEXT,
    "rank" TEXT,
    "notifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LpSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summonerId" TEXT NOT NULL,
    "lp" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LpSnapshot_summonerId_fkey" FOREIGN KEY ("summonerId") REFERENCES "Summoner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_summonerId_key" ON "Summoner"("summonerId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchId_key" ON "Match"("matchId");
