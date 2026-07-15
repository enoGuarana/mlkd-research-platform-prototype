function buildPublicationUpsertData(normalizedPublication) {
  const where = normalizedPublication.doi
    ? { doi: normalizedPublication.doi }
    : { openalexId: normalizedPublication.openalexId };

  return {
    where,
    update: normalizedPublication,
    create: {
      ...normalizedPublication,
      reviewStatus: "imported",
      isVisible: false,
    },
  };
}

module.exports = {
  buildPublicationUpsertData,
};
