(function() {
  /**
   * you can set filter function here
   */
  function selectWhichFile(file) {
    return file.status === "new";
  }

  /**
   * blew are core implementation
   */
  const totalChangedFiles = parseInt(
    document.querySelector('label[for="__Checkbox_0_changed_files"]')
      .textContent
  );
  const grid = document.querySelector(".ReactVirtualized__Grid");
  const gridHeight = parseFloat(grid.style.height);
  const rowHeight = 29;
  const numPerPage = Math.floor(gridHeight / rowHeight);
  const pages = Math.ceil(totalChangedFiles / numPerPage);

  const promisesParams = [];
  for (let i = 0; i < pages; i++) {
    promisesParams.push([i]);
  }
  sequencePromises(getPromise, promisesParams);

  function getPromise(page) {
    return new Promise(resolve => {
      const scrollTop = gridHeight * page;
      grid.scrollTop = scrollTop;

      setTimeout(() => {
        const rows = document.querySelectorAll(
          ".ReactVirtualized__Grid__innerScrollContainer .list-item"
        );
        const files = Array.prototype.map.call(rows, row =>
          getChangedFile(row)
        );
        files.forEach(file => {
          if (selectWhichFile(file)) {
            setCheckbox(file, true);
          } else {
            setCheckbox(file, false);
          }
        });
        resolve();
      }, 0); //set to next tick
    });
  }

  function setCheckbox(file, checked) {
    if (file.checkbox.checked !== checked) {
      file.checkbox.click(); //simulate user click,don't set checked directly.React Doesn't bind two-way
    }
  }

  function getChangedFile(row) {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const dirname = row.querySelector(".dirname");
    const folder = dirname ? dirname.textContent : "";
    const name = row.querySelector(".filename").textContent;
    const status = row
      .querySelector(".status")
      .getAttribute("class")
      .substring(22); /*modified,new,deleted*/
    return {
      checkbox,
      folder,
      name,
      status
    };
  }

  function sequencePromises(getPromise, promisesParams) {
    return promisesParams.reduce(function(promiseChain, promiseCurrentParam) {
      return promiseChain.then(function(chainResult) {
        var currentPromise = getPromise.apply(this, promiseCurrentParam);
        return currentPromise.then(function(currentResult) {
          chainResult.push(currentResult);
          return chainResult;
        });
      });
    }, Promise.resolve([]));
  }
})();
