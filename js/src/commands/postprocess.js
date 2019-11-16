export const postprocess = function(sets) {
  return sets.map(set => (
    set.filter(([
      /* iterName */,
      /* setId */,
      /* posId */,
      /* content */,
      mode,
    ]) => mode !== 'd')
  ))
}

export default postprocess
