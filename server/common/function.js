const applyPaginationAndFilterOnList = async (query,size,offset,name,page)=>{
    const result = await query;
    if(page===1 && result.length===0){
        throw new Error("don't have any record");
    }
    const filtered = result.filter(target => !name || target.fullname.toLowerCase().includes(name.toLowerCase()));
    const totalPages = Math.ceil(filtered.length / size);
    if (page > totalPages) throw new Error('Page Not Found');
    const list = filtered.slice(offset, offset + size);
    const totalRecords = filtered.length;
    return {list,totalRecords};
}

module.exports = {
    applyPaginationAndFilterOnList
}