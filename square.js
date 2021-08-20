{
    const MaxWorkerCount = 4;
    const OutpostEnergyThreshold = 650;
    const attackThreshold = 20;

    const molesterThreshold = 4;
    const molesterEnergyJump = 0.7;

    const user = "help";
    const enemyPlayer = "";
    const roles = [
        "harvester",
        "worker",
        "solider",
        "molester",
        "outposter",
        "reaper",
    ];

    const x = 0;
    const y = 1;
    const spirit_move_distance = 20;
    const spirit_sight_distance = 400;
    const spirit_energize_distance = 200;

    const vecMagnitude = function (vector) {
        return Math.sqrt(vector[x] * vector[x] + vector[y] * vector[y]);
    };
    const vecDistance = function (vector1, vector2) {
        const vector3 = vecSubtract(vector1, vector2);
        return vecMagnitude(vector3);
    };
    const vecAdd = function (vector1, vector2) {
        return [vector1[x] + vector2[x], vector1[y] + vector2[y]];
    };
    const vecSubtract = function (vector1, vector2) {
        return [vector1[x] - vector2[x], vector1[y] - vector2[y]];
    };
    const vecMultiplyScalar = function (vector, scalar) {
        return [vector[x] * scalar, vector[y] * scalar];
    };
    const vecNormalize = function (vector) {
        const vecMagnitude = vecMagnitude(vector);
        return [vector[x] / vecMagnitude, vector[y] / vecMagnitude];
    };
    const vecEquals = function (vector1, vector2) {
        return vector1[x] == vector2[x] && vector1[y] == vector2[y];
    };
    const vecRound = function (vector) {
        return [Math.round(vector[x]), Math.round(vector[y])];
    };

    const positionAfterMovementToTarget = function (spirit, target) {
        const vectorToTarget = vecSubtract(target.position, spirit.position);
        const directionToTarget = vecNormalize(vectorToTarget);
        const movementToTarget = vecMultiplyScalar(
            directionToTarget,
            spirit_move_distance
        );
        const positionAfterMovementToTarget = vecAdd(
            movementToTarget,
            spirit.position
        );
        return vecRound(positionAfterMovementToTarget);
    };

    const computeFirePower = function (spirit) {
        return spirit.energy < spirit.energy_capacity / 10
            ? 0
            : spirit.energy_capacity / 5;
    };

    const positionOutcome = function (
        spirit,
        spiritNewPosition,
        enemy_spirits,
        my_spirits
    ) {
        function enemyFilter(enemy) {
            const enemyNewPosition = positionAfterMovementToTarget(
                enemy,
                spirit
            );
            return (
                vecDistance(enemyNewPosition, spiritNewPosition) <=
                spirit_energize_distance
            );
        }

        const potentialEnemies = enemy_spirits.filter(enemyFilter);
        let enemyFirePower = 0;
        potentialEnemies.forEach((enemy) => {
            enemyFirePower += computeFirePower(enemy);
        });

        function friendFilter(friend) {
            for (enemy of potentialEnemies) {
                const enemyNewPosition = positionAfterMovementToTarget(
                    enemy,
                    spirit
                );
                const friendNewPosition = positionAfterMovementToTarget(
                    friend,
                    enemy
                );
                if (
                    vecDistance(friendNewPosition, enemyNewPosition) <=
                    spirit_energize_distance
                ) {
                    return true;
                }
            }
            return false;
        }

        const potentialFriends = my_spirits.filter(friendFilter);
        let friendlyFirePower = computeFirePower(spirit);
        potentialFriends.forEach((friend) => {
            friendlyFirePower += computeFirePower(friend);
        });
        return friendlyFirePower - enemyFirePower;
    };

    const engageCheck = function (spirit, my_spirits, all_spirits) {
        const enemy_spirits = spirit.sight.enemies.map(
            (enemyId) => all_spirits[enemyId]
        );
        const closestEnemy = enemy_spirits.reduce(
            (previousSpirit, currentSpirit) =>
                vecDistance(currentSpirit.position, spirit.position) <
                vecDistance(previousSpirit.position, spirit.position)
                    ? currentSpirit
                    : previousSpirit
        );
        if (
            vecDistance(closestEnemy.position, spirit.position) >=
            spirit_energize_distance - spirit_move_distance
        ) {
            //should engage?
            let spiritNewPosition = positionAfterMovementToTarget(
                spirit,
                closestEnemy
            );

            const engageOutcome = positionOutcome(
                spirit,
                spiritNewPosition,
                enemy_spirits,
                my_spirits
            );
            if (engageOutcome >= 0) {
                spirit.energize(closestEnemy);
                spirit.move(closestEnemy.position);
                return;
            }
        }

        //should hold?
        const holdOutcome = positionOutcome(
            spirit,
            spirit.position,
            enemy_spirits,
            my_spirits
        );
        if (holdOutcome >= 0) {
            spirit.energize(closestEnemy);
            return;
        }

        //should flee?
        if (true) {
            spirit.energize(closestEnemy);
            const fleeVector = vecSubtract(
                spirit.position,
                closestEnemy.position
            );
            const fleeDirection = vecNormalize(fleeVector);
            const fleeAmount =
                spirit_energize_distance +
                spirit_move_distance -
                vecMagnitude(fleeVector);
            const fleeDistance = vecMultiplyScalar(fleeDirection, fleeAmount);
            const movePosition = vecAdd(spirit.position, fleeDistance);
            spirit.move(movePosition);
            return;
        }
    };

    function distance(a, b) {
        let x = a[0] - b[0];
        let y = a[1] - b[1];
        return Math.sqrt(x * x + y * y);
    }

    function normalized(a) {
        let dist = distance(a, [0, 0]);
        return [a[0] / dist, a[1] / dist];
    }

    function vec_mul(a, b) {
        return [a[0] * b, a[1] * b];
    }

    function vec_sub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }

    function vec_add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }

    function vec_midpoint(a, b) {
        let x = (b[0] - a[0]) * 0.5 + a[0];
        let y = (b[1] - a[1]) * 0.5 + a[1];
        return [x, y];
    }

    function harvest(s) {
        s.energize(s);
    }

    function ener(target) {
        s.move(target.position);
        s.energize(target);
    }

    function roleCount(role) {
        let i = 0;
        for (s of my_spirits) {
            const isAlive = s.hp == 1;
            const isRole = s.mark == role;
            if (isAlive) {
                if (isRole) {
                    i++;
                }
            }
        }
        return i;
    }

    function dtrEnemiesInRangeX(s, range = 200) {
        let enemiesInRange;
        for (e of s.sight.enemies) {
            const enemy = {
                id: e.id,
                dist: distance(s.position, spirits[e].position),
                energy: e.energy,
            };

            const enemyInRange = enemy.dist <= range;
            if (enemyInRange) {
                enemiesInRange.push(e);
            }
        }

        const sortedByDistance = enemyInRange.sort(
            (s1, s2) => s1.dist - s2.dist
        );

        return sortedByDistance;
    }

    function dtrRelativePower(spiritList) {
        let totalPower = 0;
        for (l of spiritList) {
            totalPower += l.energy;
        }
        return totalPower;
    }

    function dtrDamageOutput(spiritList) {
        let damage;
    }

    function determineClosestStar() {
        const distToZXQ = distance(s.position, star_zxq.position);
        const distToA1C = distance(s.position, star_a1c.position);
        const isStarA1cCloser = distToA1C < distToZXQ;

        if (isStarA1cCloser) {
            return star_a1c.position;
        } else {
            return star_zxq.position;
        }
    }

    function dtrEnemyStar() {
        const distToZXQ = distance(base.position, star_zxq.position);
        const distToA1C = distance(base.position, star_a1c.position);
        const isStarA1cFarther = distToA1C > distToZXQ;
        if (isStarA1cFarther) {
            return star_a1c;
        } else {
            return star_zxq;
        }
    }

    function dtrClosestStar() {
        const distToZXQ = distance(s.position, star_zxq.position);
        const distToA1C = distance(s.position, star_a1c.position);
        const isStarA1cCloser = distToA1C < distToZXQ;
        if (isStarA1cCloser) {
            return star_a1c;
        } else {
            return star_zxq;
        }
    }

    function dtrClosestActiveStar(spirit) {
        const stars = [star_a1c, star_zxq, star_p89];
        const starsSorted = stars.sort(
            (star1, star2) =>
                vecDistance(spirit.position, star1.position) -
                vecDistance(spirit.position, star2.position)
        );
        const starsSortedFiltered = starsSorted.filter(
            (star) => star.active_in <= 0
        );
        const closestActiveStar = starsSortedFiltered[0];
        return closestActiveStar;
    }

    function determineHarvestLoc(s) {
        const distToZXQ = distance(s.position, star_zxq.position);
        const distToP89 = distance(s.position, star_p89.position);
        const distToA1C = distance(s.position, star_a1c.position);
        const isOnStarA1cHalf = distToA1C < distToZXQ;
        const isStarP89CloserThanA1C = distToP89 < distToA1C;
        const isStarP89CloserThanP89 = distToP89 < distToZXQ;

        if (isOnStarA1cHalf) {
            if (isStarP89CloserThanA1C) {
                return star_p89.position;
            } else {
                return star_a1c.position;
            }
        } else {
            if (isStarP89CloserThanP89) {
                return star_p89.position;
            } else {
                return star_zxq.position;
            }
        }
    }

    function harvesterRoutine(s, count) {
        const dist = distance(s.position, base.position);

        if (count >= 3 && base.sight.enemies.length <= 0) {
            const harvesLoc = determineHarvestLoc(s);
            const midpoint = vec_midpoint(base.position, harvesLoc);
            const optLoc = vec_midpoint(base.position, midpoint);

            s.move(optLoc);
            if (s.energy > 50) {
                s.energize(base);
            }
        } else if (s.energy == s.energy_capacity && dist > 200) {
            s.move(base.position);
        } else if (s.energy != 0 && dist < 200.0) {
            s.energize(base);
        } else {
            const harvesLoc = determineHarvestLoc(s);
            if (distance(s.position, harvesLoc) > 200) {
                s.move(harvesLoc);
            } else {
                harvest(s);
            }
        }
    }

    function workerRoutine(s, count, designation, harv, mid) {
        const hasEconCount = count >= 3;
        const dist = distance(s.position, base.position);

        if (s.sight.enemies.length > 0 && s.sight.structures.length > 0) {
            if (s.energy > 50) {
                ener(spirits[s.sight.enemies[0]]);
            } else {
                const harvesLoc = determineHarvestLoc(s);
                s.move(harvesLoc);
                harvest(s);
                // s.energize(s);
            }
        } else if (hasEconCount) {
            const closestStar = dtrClosestStar();

            if (designation == 1) {
                const harvesLoc = determineClosestStar();
                const midpoint = vec_midpoint(base.position, harvesLoc);
                if (s.position !== midpoint) {
                    s.move(midpoint);
                }
                if (s.energy > 80) {
                    s.energize(spirits[harv]);
                }
            } else if (designation == 2) {
                const harvesLoc = determineClosestStar();
                const midpoint = vec_midpoint(base.position, harvesLoc);
                const optLoc = vec_midpoint(harvesLoc, midpoint);
                if (s.position !== midpoint) {
                    s.move(optLoc);
                }
                if (s.energy > 80) {
                    s.energize(spirits[mid]);
                    // s.energize(spirits[mid]);
                } else {
                    s.energize(spirits[s.id]);
                }
            } else if (designation == 3 && closestStar.energy > 500) {
                const harvesLoc = determineClosestStar();
                const midpoint = vec_midpoint(base.position, harvesLoc);
                const optLoc = vec_midpoint(harvesLoc, midpoint);
                if (s.position !== midpoint) {
                    s.move(optLoc);
                }
                if (s.energy > 90) {
                    s.energize(spirits[mid]);
                    // s.energize(spirits[mid]);
                } else {
                    s.energize(spirits[s.id]);
                }
            } else {
                if (s.energy == s.energy_capacity && dist > 200) {
                    s.move(base.position);
                } else if (s.energy != 0 && dist < 200.0) {
                    s.energize(base);
                } else {
                    const harvesLoc = star_p89.position;
                    if (distance(s.position, harvesLoc) > 200) {
                        s.move(harvesLoc);
                    } else {
                        harvest(s);
                        // s.energize(s);
                    }
                }
            }
        } else if (s.energy == s.energy_capacity && dist > 200) {
            s.move(base.position);
        } else if (s.energy != 0 && dist < 200.0) {
            s.energize(base);
        } else {
            const harvesLoc = determineHarvestLoc(s);
            if (distance(s.position, harvesLoc) > 200) {
                s.move(harvesLoc);
            } else {
                harvest(s);
                // s.energize(s);
            }
        }
    }

    function soliderRoutine(s, sCount) {
        if (s.sight.enemies.length > 0) {
            if (s.energy > 20) {
                engageCheck(s, my_spirits, spirits);
            } else {
                const harvesLoc = determineHarvestLoc(s);
                s.move(harvesLoc);
                harvest(s);
                // s.energize(s);
            }
        } else if (s.energy >= s.energy_capacity * 0.7) {
            if (
                outpost.control != user ||
                outpost.energy < OutpostEnergyThreshold
            ) {
                ener(outpost);
            } else if (sCount >= attackThreshold) {
                if (s.sight.enemies.lenght > 0) {
                    ener(spirits[s.sight.enemies[0]]);
                } else {
                    ener(enemy_base);
                }
            } else {
                ener(base);
            }
        } else {
            if (s.sight.structures.indexOf("base") !== -1) {
                ener(base);
            } else if (
                s.sight.structures.indexOf("outpost") !== -1 &&
                s.energy > energy_capacity * molesterEnergyJump
            ) {
                ener(outpost);
            } else {
                const harvesLoc = determineHarvestLoc(s);
                s.move(harvesLoc);
                harvest(s);
                // s.energize(s);
            }
        }
    }

    function molesterRoutine(s) {
        const hasFullEnergy = s.energy == s.energy_capacity;
        const inSightOfEnemyBase = enemy_base.sight.enemies.includes(s.id);
        const hasLowEnergy = s.energy < s.energy_capacity * molesterEnergyJump;
        // console.log("EBase:" + enemy_base.sight.enemies[0])
        // console.log("id: "+s.id)
        // console.log("baseSight: " +inSightOfEnemyBase)
        // console.log("retreatBool: "+s.retreat)

        if (hasFullEnergy) {
            s.retreat = false;
            if (!inSightOfEnemyBase) {
                s.move(enemy_base.position);
            } else if (s.sight.enemies.length > 0) {
                s.energize(spirits[s.sight.enemies[0]]);
                // ener(spirits[s.sight.enemies[0]]);
            }
        } else if (!hasLowEnergy && !s.retreat) {
            s.retreat = false;
            if (!inSightOfEnemyBase) {
                s.move(enemy_base.position);
            } else if (s.sight.enemies.length > 0) {
                s.energize(spirits[s.sight.enemies[0]]);
                // ener(spirits[s.sight.enemies[0]]);
            }
        } else if (hasLowEnergy && !s.retreat) {
            s.retreat = true;
            s.jump(star_p89.position);
        } else {
            s.move(star_p89.position);
            // s.energize(s);
            harvest(s);
        }
    }

    function reaperRoutine(s) {
        const hasLowEnergy = s.energy < s.energy_capacity * 0.5;
        if (!hasLowEnergy) {
            s.move(dtrEnemyStar().position);
            if (s.sight.enemies.length > 0) {
                s.energize(spirits[s.sight.enemies[0]]);
            } else {
                harvest(s);
            }
        } else {
            s.move(dtrEnemyStar().position);
            harvest(s);
        }
    }

    function currentRoleCount() {
        const jobList = [];
        for (j of roles) {
            jobList.push(roleCount(j));
        }
        return jobList;
    }

    function outposterRoutine(s) {
        const userInControl = outpost.control == user;
        const inNeutralControl = outpost.control == "";
        const inControl = inNeutralControl || userInControl;

        const atMaxEnergy = s.energy == s.energy_capacity;
        const atAboveLimitEnergy = s.energy >= s.energy_capacity * 0.1;
        const outpostMidpoint = vec_midpoint(
            outpost.position,
            star_p89.position
        );
        const starOutpostMidpoint = vec_midpoint(
            outpost.position,
            dtrClosestStar().position
        );
        const atSufficentEnergy = outpost.energy < OutpostEnergyThreshold;
        if (s.sight.enemies.length > 0) {
            if (s.energy > 20) {
                s.energize(spirits[s.sight.enemies[0]]);
            } else {
                s.move(dtrClosestActiveStar().position);
                s.energize(s);
            }
        } else if (inControl) {
            if (atMaxEnergy) {
                s.move(outpostMidpoint);
                if (s.sight.enemies.length > 0) {
                    s.energize(spirits[s.sight.enemies[0]]);
                } else {
                    if (atSufficentEnergy) {
                        s.energize(outpost);
                    }
                }
            } else {
                s.move(outpostMidpoint);
                harvest(s);
            }
        } else {
            if (atAboveLimitEnergy) {
                s.move(starOutpostMidpoint);
                harvest(s);
            } else {
                s.move(dtrClosestStar().position);
                harvest(s);
            }
        }
    }

    console.log("Tick: " + tick);
    if (tick == 0) {
        memory.getTotalUserEnergy = 300;
        spirits["help_1"].set_mark("harvester");
        spirits["help_2"].set_mark("outposter");
        spirits["help_3"].set_mark("outposter");
    }

    let harvesterCount = roleCount("harvester");
    let workerCount = roleCount("worker");
    let soliderCount = roleCount("solider");
    let molesterCount = roleCount("molester");
    let reaperCount = roleCount("reaper");
    let outposterCount = roleCount("outposter");

    console.log("start");
    // console.log("roles: "+roles)
    console.log("harvesters: " + harvesterCount);
    console.log("workers: " + workerCount);
    console.log("soliders: " + soliderCount);
    console.log("molesters: " + molesterCount);
    console.log("reapers: " + reaperCount);
    console.log("outposters:" + outposterCount);

    let totalEnergyCollected = 0;
    for (s of my_spirits) {
        const isAlive = s.hp == 1;
        if (isAlive == 1) {
            let energyIncreased = s.prevTickEnergy < s.energy;
            if (energyIncreased) {
                totalEnergyCollected += s.energy - s.prevTickEnergy;
            }
        }
    }
    memory.getTotalUserEnergy += totalEnergyCollected;
    console.log("energyCollectedTick: " + totalEnergyCollected);
    console.log("totalEnergyCollected: " + memory.getTotalUserEnergy);
    let econCount = workerCount + harvesterCount;

    const spirit_energy_capacity = my_spirits[0].energy_capacity;
    const the_spirit_speed = 20 / 1;
    const the_spirit_energize_distance = 200;
    const travel_distance =
        distance(base.position, determineClosestStar()) -
        the_spirit_energize_distance * 2;
    const travel_ticks = travel_distance / the_spirit_speed;
    const transfer_ticks = spirit_energy_capacity;
    const spirit_star_drain_rate =
        spirit_energy_capacity / (travel_ticks * 2 + transfer_ticks * 2 - 2);
    const my_star_growth_rate = Math.round(dtrClosestStar().energy * 0.01 + 3);

    console.log("NearStarDrainRate: " + spirit_star_drain_rate);
    const my_star_decay_rate = spirit_star_drain_rate * econCount;

    console.log("friendlyStarDecayRate: " + my_star_decay_rate);
    console.log("friendlyStarGrowthRate: " + my_star_growth_rate);

    let workerDesg = 0;
    for (s of my_spirits) {
        const isAlive = s.hp == 1;

        if (isAlive) {
            if (harvesterCount == 0) {
                s.set_mark("harvester");
                harvesterCount++;
            }

            if (s.energy == s.energy_capacity && roles.indexOf(s.mark) == -1) {
                if (workerCount <= MaxWorkerCount) {
                    s.set_mark("worker");
                    workerCount++;
                } else if (
                    workerCount + soliderCount + harvesterCount >=
                        molesterThreshold &&
                    outpost.control == user &&
                    molesterCount < 1
                ) {
                    s.set_mark("molester");
                    molesterCount++;
                } else if (molesterCount >= 1 && reaperCount < 1) {
                    s.set_mark("reaper");
                    reaperCount++;
                } else if (
                    workerCount + soliderCount + harvesterCount >=
                        molesterThreshold - 1 &&
                    workerCount < 2
                ) {
                    s.set_mark("worker");
                    workerCount++;
                } else {
                    s.set_mark("solider");
                    soliderCount++;
                }
            }

            if (s.mark == "harvester") {
                memory.harvesterID = s.id;
                harvesterRoutine(s, econCount);
            }

            if (s.mark == "worker") {
                workerDesg++;
                if (workerDesg == 1) {
                    memory.workerId = s.id;
                }
                workerRoutine(
                    s,
                    econCount,
                    workerDesg,
                    memory.harvesterID,
                    memory.workerId
                );
            }
            if (s.mark == "solider") {
                soliderRoutine(s, soliderCount);
            }
            if (s.mark == "molester") {
                molesterRoutine(s);
            }
            if (s.mark == "reaper") {
                reaperRoutine(s);
            }
            if (s.mark == "outposter") {
                outposterRoutine(s);
            }

            s.shout(s.mark);
            s.prevTickEnergy = s.energy;
        }
    }
    console.log("End");
}
