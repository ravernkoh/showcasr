// Rotates the queue and returns the item rotated.
const rotate = queue => () => {
  const last = queue.pop();
  queue.insert(0, last);
  return last;
};

module.exports = array => {
  const queue = array || [];

  queue.rotate = rotate(queue);

  return queue;
};
