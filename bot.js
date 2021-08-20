{
    const roles = {
        harvester: "harvest",
        soldier: "soldier",
    };
    const rolesArray = [roles.harvester, roles.soldier];

    const player = "shatterrook";

    const firstFrame = tick == 0;

    const x = 0;
    const y = 1;

    const chase_distance = 500;

    const distance = function (vector1, vector2) {
        const vector3 = vectorSubtract(vector1, vector2);
        return magnitude(vector3);
    };
    const magnitude = function (vector) {
        return Math.sqrt(vector[x] * vector[x] + vector[y] * vector[y]);
    };
    const vectorAdd = function (vector1, vector2) {
        return [vector1[x] + vector2[x], vector1[y] + vector2[y]];
    };
    const vectorSubtract = function (vector1, vector2) {
        return [vector1[x] - vector2[x], vector1[y] - vector2[y]];
    };
    const vectorMultiplyScalar = function (vector, scalar) {
        return [vector[x] * scalar, vector[y] * scalar];
    };
    const normalize = function (vector) {
        const magnitude = magnitude(vector);
        return [vector[x] / magnitude, vector[y] / magnitude];
    };

    const ms = my_spirits;
    const my_star = base.position[x] == 1600 ? star_zxq : star_a1c;
    const my_base = base;
    const enemy_star = base.position[x] == 1600 ? star_a1c : star_zxq;
    const mid_star = star_p89;

    const vectorToStar = vectorSubtract(my_star.position, my_base.position);
    const vectorToStarHalf = vectorMultiplyScalar(vectorToStar, 0.5);
    const distanceToMidStar = distance(vectorToStarHalf, mid_star.position);
    const distanceToMyStar = distance(my_base.position, my_star.position);

    const spirit_speed = 20 / 1;
    const spirit_sight_distance = 400;
    const spirit_energize_distance = 200;
    const spirit_energy_capacity = my_spirits[0].energy_capacity;

    const chain_spacing = spirit_energize_distance;
    const createChain = function (
        spirits,
        fromPosition,
        toPosition,
        fromInclusive,
        toInclusive
    ) {
        const chainDistance = distance(fromPosition, toPosition);
        console.log(chainDistance);
        const chainSpaceCount = Math.ceil(chainDistance / chain_spacing);
        const chainSpacing = 1 / chainSpaceCount;
        const toVector = vectorSubtract(toPosition, fromPosition);
        const fromInclusiveInt = fromInclusive ? 0 : 1;
        const toInclusiveInt = toInclusive ? 0 : 1;
        spirits.forEach((spirit, i) => {
            const chainIndexPosition =
                (i % (chainCount + 1 - toInclusiveInt - fromInclusiveInt)) +
                fromInclusiveInt;
            const chainIndexId =
                i % (chainCount + 1 - toInclusiveInt - fromInclusiveInt);
            const scaledVector = vectorMultiplyScalar(
                toVector,
                chainSpacing * chainIndexPosition
            );
            const position = vectorAdd(scaledVector, fromPosition);
            spirit.move(position);
        });
    };

    const travel_distance =
        distance(my_base.position, my_star.position) -
        spirit_energize_distance * 2;
    const travel_ticks = travel_distance / spirit_speed;
    const transfer_ticks = spirit_energy_capacity;
    const spirit_star_drain_rate =
        spirit_energy_capacity / (travel_ticks * 2 + transfer_ticks * 2 - 2);
    const my_star_growth_rate = Math.round(my_star.energy * 0.01 + 3);
    const harvester_spirits = my_spirits.filter(
        (spirit) => spirit.role == roles.harvester
    );

    const energizeFunc = function (spirit, target) {
        const isStar =
            (target == my_star) | (target == mid_star) | (target == enemy_star);
        if (
            distance(spirit.position, target.position) <=
            spirit_energize_distance
        ) {
            spirit.energize(isStar ? spirit : target);
        } else {
            spirit.move(target.position);
        }
    };

    const moveAwayFromFunc = function (spirit, target) {
        const vectorTargetToSelf = vectorSubtract(
            spirit.position,
            target.position
        );
        const moveDirection = vectorAdd(spirit.position, vectorTargetToSelf);
        spirit.move(moveDirection);
    };

    const assignRole = function (spirit, role) {
        spirit.role = role;
        spirit.shout(spirit.role);
    };
    const assignTask = function (spirit, task) {
        spirit.task = task;
        //spirit.shout(`${spirit.role}: ${spirit.task}`.substr(0, 20));
    };

    const harvestMyStarFunc = function (spirit, harvestSpirits) {
        if (!spirit.harvest) {
            spirit.harvest = {};
            const extra = harvestSpirits.length % 3;
            if (extra == 0) {
                spirit.harvest.role = "base";
            } else {
                spirit.harvest.baseSpirit =
                    harvestSpirits[harvestSpirits.length - extra];
                spirit.harvest.role = "star";
            }
            harvestSpirits.push(spirit);
        }

        switch (spirit.harvest.role) {
            case "base":
                //assign new task
                switch (spirit.harvest.task) {
                    case "energize_base":
                        if (
                            spirit.harvest.starSpirit &&
                            spirit.harvest.starSpirit.energy ===
                                starSpirit.energy_capacity - 2
                        ) {
                            spirit.harvest.task = "receive_final_energies";
                        } else if (spirit.energy === 0) {
                            spirit.harvest.task = "receive_energy";
                        }
                        break;
                    case "receive_final_energies":
                        if (spirit.energy === 2) {
                            spirit.harvest.task = "energize_final_base";
                        }
                        break;
                    case "energize_final_base":
                        if (spirit.energy === 0) {
                            spirit.harvest.task = "receive_energy";
                        }
                        break;
                    case "receive_energy":
                        if (spirit.energy === 1) {
                            spirit.harvest.task = "energize_base";
                        }
                        break;
                    default:
                        spirit.harvest.task = "energize_base";
                }
                //assign new task
                switch (spirit.harvest.task) {
                    case "energize_base":
                        energizeFunc(spirit, my_base);
                        break;
                    case "receive_final_energies":
                        const vectorToStar = vectorSubtract(
                            my_star.position,
                            my_base.position
                        );
                        const relativePositionToWait =
                            (vectorToStar / spirit_speed) * 1;
                        const absolutePositionToWait = vectorAdd(
                            relativePositionToWait,
                            my_base.position
                        );
                        spirit.energize(my_base);
                        spirit.move(absolutePositionToWait);
                        break;
                    case "energize_final_base":
                        energizeFunc(spirit, my_base);
                        break;
                    case "receive_energy":
                        const vectorToStar = vectorSubtract(
                            my_star.position,
                            my_base.position
                        );
                        const relativePositionToWait =
                            (vectorToStar / spirit_speed) * 1;
                        const absolutePositionToWait = vectorAdd(
                            relativePositionToWait,
                            my_base.position
                        );
                        spirit.energize(my_base);
                        spirit.move(absolutePositionToWait);
                        break;
                    default:
                        console.log("harvestMyStarFunc no harvest.task");
                }
                break;
            case "star":
                //assign new task
                switch (spirit.harvest.task) {
                    case "energize_star":
                        if (spirit.energy === spirit.energy_capacity - 1) {
                            spirit.harvest.task = "transition_to_transfer";
                        }
                        break;
                    case "transition_to_transfer":
                        if (spirit.energy === spirit.energy_capacity) {
                            spirit.harvest.task = "transfer_energy";
                        }
                        break;
                    case "transfer_energy":
                        if (spirit.energy === spirit.energy_capacity - 2) {
                            spirit.harvest.task = "transition_to_energize";
                        }
                        break;
                    case "transition_to_energize":
                        if (spirit.energy === 0) {
                            spirit.harvest.task = "energize_star";
                        }
                        break;
                    default:
                        spirit.harvest.task = "energize_star";
                }
                //execute task
                switch (spirit.harvest.task) {
                    case "energize_star":
                        energizeFunc(spirit, my_star);
                        break;
                    case "transition_to_transfer":
                        const vectorToBase = vectorSubtract(
                            my_base.position,
                            my_star.position
                        );
                        const relativePositionToWait =
                            (vectorToBase / spirit_speed) * 4;
                        const absolutePositionToWait = vectorAdd(
                            relativePositionToWait,
                            my_star.position
                        );
                        spirit.energize(my_star);
                        spirit.move(absolutePositionToWait);
                        break;
                    case "transfer_energy":
                        const vectorToBase = vectorSubtract(
                            my_base.position,
                            my_star.position
                        );
                        const relativePositionToWait =
                            (vectorToBase / spirit_speed) * 4;
                        const absolutePositionToWait = vectorAdd(
                            relativePositionToWait,
                            my_star.position
                        );
                        spirit.energize(spirit.harvest.baseSpirit);
                        spirit.move(absolutePositionToWait);
                        spirit.harvest.starSpirit = spirit;
                        break;
                    case "transition_to_energize":
                        spirit.energize(spirit.harvest.baseSpirit);
                        spirit.move(my_star.position);
                        break;
                    default:
                        console.log("harvestMyStarFunc no harvest.task");
                }
                break;
            default:
                console.log("harvestMyStarFunc no harvest.role");
                break;
        }
    };
    const harvestFunc = function (spirit) {
        if (spirit.energy == spirit.energy_capacity) {
            assignTask(spirit, "charge_base");
        } else if (spirit.energy == 0) {
            assignTask(spirit, "harvest_star");
        }
        switch (spirit.task) {
            case "charge_base":
                energizeFunc(spirit, base);
                if (spirit.energy == 1) {
                    energizeFunc(spirit, my_star);
                }
                break;
            case "harvest_star":
                energizeFunc(spirit, my_star);
                if (spirit.energy == spirit.energy_capacity - 1) {
                    energizeFunc(spirit, base);
                }
                break;
            default:
                spirit.shout("error: no task");
                assignTask("harvest_star");
                break;
        }
        if (spirit.energy != 0) {
            let nearestEnemyDistance = Number.MAX_VALUE;
            let nearestEnemy;
            for (enemyId of spirit.sight.enemies) {
                const enemy = spirits[enemyId];
                const distanceToEnemy = distance(
                    spirit.position,
                    enemy.position
                );
                if (distanceToEnemy > spirit_energize_distance) {
                    continue;
                }
                if (distanceToEnemy < nearestEnemyDistance) {
                    nearestEnemyDistance = distanceToEnemy;
                    nearestEnemy = enemy;
                }
            }
            const distanceToMyStar = distance(
                spirit.position,
                my_star.position
            );
            const distanceToMyBase = distance(
                spirit.position,
                my_base.position
            );
            if (
                nearestEnemy != undefined &&
                (distanceToMyBase <= chase_distance ||
                    distanceToMyStar <= chase_distance)
            ) {
                energizeFunc(spirit, nearestEnemy);
            }
        }
    };
    const soldierFunc = function (spirit) {
        const doesSeeEnemy = spirit.sight.enemies.length > 0;
        const doesSeeTower = spirit.sight.structures.includes("outpost_mdo");
        const doesOwnTower = outpost.control == player;
        const isMaxEnergy = spirit.energy == spirit.energy_capacity;
        const hasNoEnergy = spirit.energy == 0;
        const isTowerMaxEnergy = outpost.energy != outpost.energy_capacity;

        if (spirit.mergeTarget) {
            assignTask(spirit, "merge");
        } else if (hasNoEnergy) {
            if (!doesSeeEnemy) {
                assignTask(spirit, "harvest_enemy_star");
            }
        } else {
            if (doesSeeTower) {
                if (doesOwnTower) {
                    if (!isTowerMaxEnergy) {
                        if (isMaxEnergy) {
                            assignTask(spirit, "attack_tower");
                        } else if (hasNoEnergy) {
                            assignTask(spirit, "harvest_mid_star");
                        }
                    }
                } else {
                    assignTask(spirit, "attack_tower");
                }
            } else if (doesSeeEnemy) {
                assignTask(spirit, "attack_enemy");
            } else {
                assignTask(spirit, "attack_enemy_base");
            }
        }

        switch (spirit.task) {
            case "attack_enemy":
                {
                    let totalEnemyDamage = 0;
                    let nearestEnemyDistance = Number.MAX_VALUE;
                    let nearestEnemy;
                    for (enemyId of spirit.sight.enemies) {
                        const enemy = spirits[enemyId];
                        const distanceToEnemy = distance(
                            spirit.position,
                            enemy.position
                        );
                        if (distanceToEnemy < nearestEnemyDistance) {
                            nearestEnemyDistance = distanceToEnemy;
                            nearestEnemy = enemy;
                        }
                        if (enemy.energy == 0) continue;
                        if (
                            distanceToEnemy >
                            spirit_energize_distance + spirit_speed
                        ) {
                            continue;
                        }
                        totalEnemyDamage += enemy.size * 2;
                    }
                    let totalAllyDamage = spirit.size * 2;
                    let nearestAllyDistance = Number.MAX_VALUE;
                    let nearestAlly;
                    for (friendId of spirit.sight.friends) {
                        const ally = spirits[friendId];
                        const allyDistance = distance(
                            spirit.position,
                            ally.position
                        );
                        if (allyDistance < nearestAllyDistance) {
                            nearestAllyDistance = allyDistance;
                            nearestAlly = ally;
                        }
                        if (ally.energy == 0) continue;
                        const allyDistanceToEnemy = distance(
                            nearestEnemy.position,
                            ally.position
                        );
                        if (allyDistanceToEnemy > spirit_energize_distance) {
                            continue;
                        }
                        totalAllyDamage += ally.size * 2;
                    }

                    // console.log(
                    //     `${spirit.id} atk: ${totalAllyDamage}/${totalEnemyDamage}`
                    // );
                    if (totalEnemyDamage >= spirit.energy) {
                        if (nearestAlly && !spirit.isMergeTarget) {
                            spirit.mergeTarget = nearestAlly;
                            spirit.energize(nearestEnemy);
                            spirit.move(spirit.mergeTarget.position);
                            spirit.merge(spirit.mergeTarget);
                            spirit.mergeTarget.isMergeTarget = true;
                            console.log(`${spirit.id} merging`);
                        } else {
                            //flee
                            spirit.energize(nearestEnemy);
                            moveAwayFromFunc(spirit, nearestEnemy);
                            spirit.divide();
                            console.log(`${spirit.id} fleeing`);
                        }
                    } else {
                        if (nearestEnemyDistance < spirit_energize_distance) {
                            spirit.energize(nearestEnemy);
                            moveAwayFromFunc(spirit, nearestEnemy);
                            console.log(`${spirit.id} attacking away`);
                        } else {
                            energizeFunc(spirit, nearestEnemy);
                            console.log(`${spirit.id} attacking towards`);
                        }
                    }
                    // if (
                    //     totalEnemyDamage > totalAllyDamage &&
                    //     nearestEnemyDistance > spirit_energize_distance
                    // ) {
                    //     //flee
                    //     const enemyVector = vectorSubtract(
                    //         spirit.position,
                    //         nearestEnemy.position
                    //     );
                    //     const moveDirection = vectorAdd(
                    //         spirit.position,
                    //         enemyVector
                    //     );
                    //     spirit.move(moveDirection);
                    // } else {
                    //     //attack
                    //     if (totalEnemyDamage > totalAllyDamage) {
                    //         const enemyVector = vectorSubtract(
                    //             spirit.position,
                    //             nearestEnemy.position
                    //         );
                    //         const moveDirection = vectorAdd(
                    //             spirit.position,
                    //             enemyVector
                    //         );
                    //         spirit.move(moveDirection);
                    //         spirit.energize(nearestEnemy);
                    //     } else {
                    //         energizeFunc(spirit, nearestEnemy);
                    //     }
                    // }
                }
                break;

            case "attack_enemy_base":
                energizeFunc(spirit, enemy_base);
                break;
            case "harvest_enemy_star":
                energizeFunc(spirit, enemy_star);
                break;
            case "attack_tower":
                energizeFunc(spirit, outpost);
                break;
            case "harvest_mid_star":
                energizeFunc(spirit, mid_star);
                break;
            case "merge":
                {
                    let nearestEnemyDistance = Number.MAX_VALUE;
                    let nearestEnemy;
                    for (enemyId of spirit.sight.enemies) {
                        const enemy = spirits[enemyId];
                        const distanceToEnemy = distance(
                            spirit.position,
                            enemy.position
                        );
                        if (distanceToEnemy < nearestEnemyDistance) {
                            nearestEnemyDistance = distanceToEnemy;
                            nearestEnemy = enemy;
                        }
                        if (enemy.energy == 0) continue;
                        if (
                            distanceToEnemy >
                            spirit_energize_distance + spirit_speed
                        ) {
                            continue;
                        }
                    }
                    if (nearestEnemy) {
                        spirit.energize(nearestEnemy);
                    }
                    if (spirit.mergeTarget) {
                        spirit.move(spirit.mergeTarget.position);
                        spirit.merge(spirit.mergeTarget);
                        spirit.mergeTarget.isMergeTarget = true;
                    }
                }

                break;
            default:
                spirit.shout("error: no task");
                assignTask("harvest_mid_star");
                break;
        }
    };

    //role assignment
    const livingSpirits = my_spirits.filter((spirit) => spirit.hp == 1);
    const babies = livingSpirits.filter((spirit) => spirit.role == undefined);
    babies.forEach((spirit) => assignRole(spirit, roles.harvester));

    const harvesters = livingSpirits.filter(
        (spirit) => spirit.role == roles.harvester
    );
    const harvestersSorted = harvesters.sort(
        (spirit1, spirit2) => spirit2.energy - spirit1.energy
    );
    const soldiers = livingSpirits.filter(
        (spirit) => spirit.role == roles.soldier
    );
    const my_star_decay_rate = spirit_star_drain_rate * harvesters.length;
    if (my_star_decay_rate > my_star_growth_rate) {
        const count = Math.ceil(
            (my_star_decay_rate - my_star_growth_rate) / spirit_star_drain_rate
        );
        const harvestersRemoved = harvestersSorted.splice(0, count);
        harvestersRemoved.forEach((spirit) =>
            assignRole(spirit, roles.soldier)
        );
    }
    for (spirit of soldiers) {
        const doesSeeEnemy = spirit.sight.enemies.length > 0;
        const hasNoEnergy = spirit.energy == 0;
        if (doesSeeEnemy && hasNoEnergy) {
            assignRole(spirit, roles.harvester);
        }
        spirit.isMergeTarget = false;
    }
    console.log(
        `harvesters: ${harvestersSorted.length} soldiers: ${soldiers.length}`
    );
    console.log(
        `my star growth/drain: ${my_star_growth_rate}/${
            spirit_star_drain_rate * harvesters.length
        }`
    );
    console.log(`outpost owner: ${outpost.control}`);
    console.log(`ticks: ${tick}`);

    // if (firstFrame) {
    // createChain(my_spirits, my_base.position, my_star.position, false, false);
    // }

    //role execution
    for (spirit of livingSpirits) {
        spirit.shout(spirit.id);
        // chainFunc(spirit);
        switch (spirit.role) {
            case roles.harvester:
                //harvestMyStarFunc
                harvestFunc(spirit);
                break;
            case roles.soldier:
                soldierFunc(spirit);
                break;
            default:
                spirit.shout("error: no role");
                break;
        }
    }

    // my_spirits[0].move([1600, 900]);
    // my_spirits[1].move([1600, 1101]);
    // if (tick >= 100) {
    //     my_spirits[1].move([1600, 1100]);
    // }
    // const found = my_spirits[0].sight.friends.includes(my_spirits[1])
    //     ? "seen"
    //     : "not";
    // my_spirits[0].sight.friends.forEach((friend) => console.log(friend.id));
    // console.log(`[0] sight: ${found}`);
}
