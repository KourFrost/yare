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
    const movementToTarget = vecMultiplyScalar(directionToTarget, spirit_speed);
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
        const enemyNewPosition = positionAfterMovementToTarget(enemy, spirit);
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
    const closestEnemy = enemy_spirits.reduce((previousSpirit, currentSpirit) =>
        vecDistance(currentSpirit.position, spirit.position) <
        vecDistance(previousSpirit.position, spirit.position)
            ? currentSpirit
            : previousSpirit
    );
    if (
        vecDistance(closestEnemy.position, spirit.position) >=
        spirit_energize_distance - spirit_speed
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
        const fleeVector = vecSubtract(spirit.position, closestEnemy.position);
        const fleeDirection = vecNormalize(fleeVector);
        const fleeAmount =
            spirit_energize_distance + spirit_speed - vecMagnitude(fleeVector);
        const fleeDistance = vecMultiplyScalar(fleeDirection, fleeAmount);
        const movePosition = vecAdd(spirit.position, fleeDistance);
        spirit.move(movePosition);
        return;
    }
};
