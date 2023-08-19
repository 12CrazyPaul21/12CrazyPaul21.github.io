const Hexo = require('hexo');

const build_category_tree = (categories, parent='') => {
    let {filtered: sub_categories, excluded: remain} = categories.reduce(
        (result, category) => {
            if ('parent' in category && category['parent'] != parent) {
                result.excluded.push(category);
            } else {
                result.filtered.push(category);
            }
            return result;
        },
        {filtered: [], excluded: []}
    );

    sub_categories.sort((l, r) => {
        if (l.name < r.name) {
            return -1;
        } else if (l.name > r.name) {
            return 1;
        } else {
            return 0;
        }
    });

    return sub_categories.map(category => {
        return {
            name: category.name,
            subs: build_category_tree(remain, category._id)
        }
    });
};

const show_category_tree = (category_tree, prefix='') => {
    category_tree.forEach(item => {
        console.log(prefix + '|-' + item.name);
        show_category_tree(item.subs, prefix + '|  ');
    });
};

(async function() {
    let hexo = new Hexo(process.cwd(), {});

    await hexo.init();
    await hexo.load();

    show_category_tree(build_category_tree(hexo.locals.get('categories').toArray()));
})();