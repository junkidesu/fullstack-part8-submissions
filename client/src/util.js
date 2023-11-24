export const updateBooks = (cache, query, addedBook) => {
  const helper = (books) => {
    const seenBooks = new Set();
    return books.filter((book) => {
      const title = book.title;
      return seenBooks.has(title) ? false : seenBooks.add(title);
    });
  };

  cache.updateQuery({ query }, (data) => {
    if (!data) return null;

    return {
      allBooks: helper(data.allBooks.concat(addedBook)),
    };
  });

  addedBook.genres.forEach((genre) => {
    cache.updateQuery({ query, variables: { genre } }, (data) => {
      if (!data) return null;

      return {
        allBooks: helper(data.allBooks.concat(addedBook)),
      };
    });
  });
};
